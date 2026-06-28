#!/usr/bin/env python3
"""
verify.py — Independent Evaluator (5-dimension check)
This does NOT write code. It only runs verification and outputs pass/fail.

Usage:
    python verify.py              # Run all checks
    python verify.py --feature X  # Verify specific feature only
    python verify.py --self-test  # Self-test all criterion handlers
    python verify.py --lock X     # Acquire lock on feature X
    python verify.py --unlock     # Release lock
    python verify.py --check-lock X  # Check if lock is available

Exit codes:
    0 = PASSING
    1 = FAILING
"""

import json
import os
import re
import subprocess
import sys
import time
import hashlib
from datetime import datetime, timedelta
from pathlib import Path


# ── Lock Management ──────────────────────────────────────────────

LOCK_FILE = Path(".verify.lock")
LOCK_TIMEOUT_MINUTES = 15


def _get_python_cmd():
    """Return the best Python command, preferring virtual env."""
    if sys.platform == "win32":
        candidates = [".venv/Scripts/python.exe", ".venv/bin/python", "python", "python3"]
    else:
        candidates = [".venv/bin/python", "python", "python3"]
    for c in candidates:
        p = Path(c)
        if p.exists():
            return str(p.resolve())
    return "python"


def _acquire_lock(feature_id):
    LOCK_FILE.write_text(json.dumps({
        "feature": feature_id,
        "acquired_at": datetime.now().isoformat(),
        "pid": os.getpid(),
    }), encoding="utf-8")
    print(f"  Lock acquired: {feature_id} at {datetime.now().isoformat()}")


def _release_lock():
    if LOCK_FILE.exists():
        LOCK_FILE.unlink()
        print("  Lock released.")


def _check_lock(feature_id=None):
    if not LOCK_FILE.exists():
        print("  No lock found — workspace is free.")
        return True
    try:
        data = json.loads(LOCK_FILE.read_text(encoding="utf-8"))
        held = data.get("feature", "?")
        acquired = datetime.fromisoformat(data["acquired_at"])
        elapsed = datetime.now() - acquired
        if elapsed > timedelta(minutes=LOCK_TIMEOUT_MINUTES):
            print(f"  ⚠ Lock on '{held}' is STALE ({elapsed.total_seconds()/60:.0f}m ago > {LOCK_TIMEOUT_MINUTES}m)")
            print(f"  Use --force to takeover.")
            return False
        if feature_id and data["feature"] != feature_id:
            print(f"  Lock held by '{held}' (not '{feature_id}') — may conflict.")
            return True
        print(f"  Lock held by '{held}' (PID {data.get('pid','?')}), {elapsed.total_seconds()/60:.1f}m ago")
        return True
    except Exception as e:
        print(f"  Lock file corrupted: {e}")
        return False


# ── Colors & Helpers ─────────────────────────────────────────────

class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    CYAN = '\033[0;36m'
    NC = '\033[0m'


def print_header(text):
    print(f"\n{Colors.BLUE}{'='*60}{Colors.NC}")
    print(f"{Colors.BLUE}{text}{Colors.NC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}\n")


def print_check(name, passed, details=""):
    status = f"{Colors.GREEN}[PASS]{Colors.NC}" if passed else f"{Colors.RED}[FAIL]{Colors.NC}"
    print(f"  {status} {name}")
    if details and not passed:
        print(f"         {Colors.YELLOW}{details}{Colors.NC}")
    elif details and passed:
        print(f"         {details}")


# ── Criterion Handlers ───────────────────────────────────────────

def handle_file_exists(criterion):
    path = Path(criterion["path"])
    exists = path.exists()
    return exists, "" if exists else f"File not found: {criterion['path']}"


def handle_file_contains(criterion):
    path = Path(criterion["path"])
    pattern = criterion["pattern"]
    if not path.exists():
        return False, f"File not found: {criterion['path']}"
    content = path.read_text(encoding='utf-8', errors='replace')
    found = pattern in content
    return found, "" if found else f"Pattern not found in {criterion['path']}: '{pattern}'"


def handle_file_not_contains(criterion):
    path = Path(criterion["path"])
    pattern = criterion["pattern"]
    if not path.exists():
        return True, ""
    content = path.read_text(encoding='utf-8', errors='replace')
    found = pattern in content
    return not found, "" if not found else f"Pattern should NOT be in {criterion['path']}: '{pattern}'"


def handle_route_registered(criterion):
    """Detect FastAPI routes (project uses FastAPI, not Fastify)."""
    path = Path(criterion["path"])
    route_pattern = criterion.get("route_pattern", "")
    if not path.exists():
        return False, f"Route file not found: {criterion['path']}"
    content = path.read_text(encoding='utf-8', errors='replace')
    # FastAPI route patterns
    found = bool(re.search(r'app\.(get|post|put|delete|patch)\s*\(', content)) or \
            bool(re.search(r'@app\.(get|post|put|delete|patch)\s*\(', content)) or \
            bool(re.search(r'router\.(get|post|put|delete|patch)\s*\(', content)) or \
            bool(re.search(r'@router\.(get|post|put|delete|patch)\s*\(', content))
    if not found:
        return False, f"No FastAPI routes found in {criterion['path']}"
    if route_pattern:
        found = bool(re.search(route_pattern, content, re.IGNORECASE))
        return found, "" if found else f"Route pattern not found in {criterion['path']}"
    return True, ""


def handle_test_passes(criterion):
    cmd = criterion["command"]
    py = _get_python_cmd()
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=120,
                                encoding='utf-8', errors='replace')
        passed = result.returncode == 0
        return passed, "" if passed else f"Test failed (exit {result.returncode}): {cmd}"
    except subprocess.TimeoutExpired:
        return False, f"Test timed out (>120s): {cmd}"
    except Exception as e:
        return False, f"Test error: {str(e)}"


HANDLERS = {
    "file_exists": handle_file_exists,
    "file_contains": handle_file_contains,
    "file_not_contains": handle_file_not_contains,
    "route_registered": handle_route_registered,
    "test_passes": handle_test_passes,
}


# ── Evaluator ────────────────────────────────────────────────────

class Evaluator:
    def __init__(self, verbose=False, feature_id=None):
        self.verbose = verbose
        self.feature_id = feature_id
        self.results = {
            "code_correctness": False,
            "documentation_sync": False,
            "test_coverage": False,
            "feature_completeness": False,
        }
        self.errors = []

    def check_code_correctness(self):
        """Layer 1: Code correctness (lint + typecheck)"""
        print_header("Layer 1: Code Correctness")

        # Run lint_check.sh via bash (Git Bash on Windows)
        try:
            result = subprocess.run(
                ["bash", "lint_check.sh"],
                capture_output=True, text=True, timeout=60,
                encoding='utf-8', errors='replace',
            )
            passed = result.returncode == 0
            print_check("lint_check.sh", passed, result.stderr.strip()[-500:] if not passed and result.stderr else "")
            self.results["code_correctness"] = passed
            return passed
        except FileNotFoundError:
            print_check("lint_check.sh", False, "bash not found — try Git Bash")
            self.results["code_correctness"] = False
            return False
        except subprocess.TimeoutExpired:
            print_check("lint_check.sh", False, "Timeout after 60s")
            self.results["code_correctness"] = False
            return False

    def check_documentation_sync(self):
        """Layer 2: Documentation sync"""
        print_header("Layer 2: Documentation Sync")

        try:
            result = subprocess.run(
                ["bash", "done_check.sh"],
                capture_output=True, text=True, timeout=30,
                encoding='utf-8', errors='replace',
            )
            passed = result.returncode == 0
            print_check("done_check.sh", passed, result.stderr.strip()[-500:] if not passed and result.stderr else "")
            self.results["documentation_sync"] = passed
            return passed
        except FileNotFoundError:
            print_check("done_check.sh", False, "bash not found — try Git Bash")
            self.results["documentation_sync"] = False
            return False
        except subprocess.TimeoutExpired:
            print_check("done_check.sh", False, "Timeout after 30s")
            self.results["documentation_sync"] = False
            return False

    def check_test_coverage(self):
        """Check test files exist"""
        print_header("Test Coverage")

        test_patterns = ["test_*.py", "test_*.js", "*.test.js", "*.test.ts", "*.spec.js", "*.spec.ts"]
        test_files = []
        for pat in test_patterns:
            test_files.extend(Path(".").rglob(pat))

        if not test_files:
            print_check("Test files exist", False, "No test files found (test_*.py, *.test.*, etc.)")
            self.results["test_coverage"] = False
            return False

        print_check("Test files exist", True, f"Found {len(test_files)} test file(s)")
        self.results["test_coverage"] = True
        return True

    def check_single_criterion(self, criterion):
        """Dispatch to the appropriate handler."""
        ctype = criterion.get("type")
        handler = HANDLERS.get(ctype)
        if handler is None:
            return False, f"Unknown criterion type: {ctype}"
        return handler(criterion)

    def check_feature_completeness(self, feature_id=None):
        """Layer 3: Feature completeness check"""
        print_header("Layer 3: Feature Completeness")

        feature_file = Path("feature_list.json")
        if not feature_file.exists():
            print_check("Feature list", False, "feature_list.json not found")
            self.results["feature_completeness"] = False
            return False

        try:
            with open(feature_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print_check("Feature list", False, f"Error reading: {e}")
            self.results["feature_completeness"] = False
            return False

        features = data.get("features", [])
        if not features:
            print_check("Features defined", False, "No features in feature_list.json")
            self.results["feature_completeness"] = False
            return False

        if feature_id:
            features = [f for f in features if f["id"] == feature_id]
            if not features:
                print_check(f"Feature {feature_id}", False, "Feature not found")
                self.results["feature_completeness"] = False
                return False

        all_passed = True
        total_criteria = 0
        passed_criteria = 0

        for feature in features:
            fid = feature["id"]
            fname = feature.get("name", fid)
            status = feature.get("status", "unknown")
            criteria = feature.get("done_criteria", [])

            if not criteria:
                print_check(f"{fid}: {fname}", False, "No done_criteria defined")
                all_passed = False
                continue

            feature_passed = True
            failed_criteria = []

            for i, criterion in enumerate(criteria):
                total_criteria += 1
                passed, message = self.check_single_criterion(criterion)
                if passed:
                    passed_criteria += 1
                else:
                    feature_passed = False
                    failed_criteria.append(f"  [{i+1}] {criterion.get('type', '?')}: {message}")

            if feature_passed:
                print_check(f"{fid}: {fname}", True, f"{len(criteria)} criteria met [{status}]")
            else:
                print_check(f"{fid}: {fname}", False, f"{len(criteria)-len(failed_criteria)}/{len(criteria)} criteria met [{status}]")
                for fc in failed_criteria:
                    print(f"         {Colors.YELLOW}{fc}{Colors.NC}")
                all_passed = False

        self.results["feature_completeness"] = all_passed
        print(f"\n  {Colors.BLUE}Criteria: {passed_criteria}/{total_criteria} passed{Colors.NC}")
        return all_passed

    def run_all_checks(self):
        """Run all verification layers"""
        print_header("STATIC VERIFICATION (verify.py)")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Working directory: {os.getcwd()}")
        if self.feature_id:
            print(f"Checking feature: {self.feature_id}")
        print()
        print(f"  NOTE: This is verify.py static checks only.")
        print(f"  Full Evaluator verification requires spawned agent with Playwright MCP.")
        print()

        self.check_code_correctness()
        self.check_documentation_sync()
        self.check_test_coverage()
        self.check_feature_completeness(self.feature_id)

        # Summary
        print_header("EVALUATOR SUMMARY")
        passed = sum(1 for v in self.results.values() if v)
        total = len(self.results)

        print(f"  Results: {passed}/{total} passed\n")
        for check, result in self.results.items():
            status = f"{Colors.GREEN}*{Colors.NC}" if result else f"{Colors.RED}X{Colors.NC}"
            print(f"  {status} {check.replace('_', ' ').title()}")

        print()
        if passed == total:
            print(f"{Colors.GREEN}  VERDICT: PASSING{Colors.NC}")
            print(f"  All static checks passed.")
            print(f"  NOTE: This is NOT full Evaluator verification (no build check, no Playwright MCP).")
            return 0
        else:
            print(f"{Colors.RED}  VERDICT: FAILING{Colors.NC}")
            print(f"  {total - passed} static check(s) failed.")
            return 1


def run_self_test():
    """Self-test: verify all criterion handlers work correctly."""
    print_header("SELF-TEST: Criterion Handlers")
    all_ok = True

    # Test file_exists (should fail — this file doesn't exist)
    ok, msg = handle_file_exists({"path": "nonexistent_xyz.txt"})
    status = "PASS" if not ok else "FAIL"
    print_check(f"file_exists (negative)", not ok, msg)
    if ok:
        all_ok = False

    # Test file_exists (should pass)
    ok, msg = handle_file_exists({"path": "verify.py"})
    status = "PASS" if ok else "FAIL"
    print_check(f"file_exists (positive)", ok, msg)
    if not ok:
        all_ok = False

    # Test file_contains
    ok, msg = handle_file_contains({"path": "verify.py", "pattern": "Independent Evaluator"})
    print_check(f"file_contains", ok, msg)
    if not ok:
        all_ok = False

    # Test file_not_contains (use a file we know doesn't exist — negation makes it pass)
    ok, msg = handle_file_not_contains({"path": "nonexistent_xyz.txt", "pattern": "anything"})
    print_check(f"file_not_contains (negative file)", ok, msg)
    if not ok:
        all_ok = False

    # Test handler count
    print_check(f"Handler dispatch (known types)", len(HANDLERS) >= 5, f"Registered {len(HANDLERS)} handlers")
    if len(HANDLERS) < 5:
        all_ok = False

    print()
    if all_ok:
        print(f"{Colors.GREEN}  SELF-TEST: ALL PASSED{Colors.NC}")
        return 0
    else:
        print(f"{Colors.RED}  SELF-TEST: SOME FAILED{Colors.NC}")
        return 1


# ── Main ─────────────────────────────────────────────────────────

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Static Verification (verify.py) — NOT full Evaluator agent")
    parser.add_argument("--feature", help="Check specific feature ID")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--self-test", action="store_true", help="Self-test all criterion handlers")
    parser.add_argument("--lock", metavar="FEATURE_ID", help="Acquire lock on feature")
    parser.add_argument("--unlock", action="store_true", help="Release lock")
    parser.add_argument("--check-lock", metavar="FEATURE_ID", nargs="?", const="_any", help="Check lock status")
    parser.add_argument("--force", action="store_true", help="Force takeover stale lock")
    args = parser.parse_args()

    # Fix Windows console encoding
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    # Handle lock commands
    if args.lock:
        _acquire_lock(args.lock)
        return 0
    if args.unlock:
        _release_lock()
        return 0
    if args.check_lock is not None:
        _check_lock(args.check_lock if args.check_lock != "_any" else None)
        return 0

    # Self-test mode
    if args.self_test:
        return run_self_test()

    evaluator = Evaluator(verbose=args.verbose, feature_id=args.feature)
    exit_code = evaluator.run_all_checks()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
