#!/usr/bin/env python3
"""
verify.py — Independent Evaluator (5-dimension check)
This does NOT write code. It only runs verification and outputs pass/fail.

Usage:
    python verify.py              # Run all checks
    python verify.py --feature X  # Verify specific feature only

Exit codes:
    0 = PASSING
    1 = FAILING
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path


class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
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


class Evaluator:
    def __init__(self, verbose=False, feature_id=None):
        self.verbose = verbose
        self.feature_id = feature_id
        self.results = {
            "code_correctness": False,
            "documentation_sync": False,
            "test_coverage": False,
            "feature_completeness": False
        }
        self.errors = []

    def check_code_correctness(self):
        """Layer 1: Code correctness (lint + typecheck)"""
        print_header("Layer 1: Code Correctness")

        # Run lint_check.sh for syntax + TypeScript typecheck
        import shutil
        if not shutil.which('bash'):
            print_check("lint_check.sh", False, "bash not available — cannot run lint")
            self.results["code_correctness"] = False
            return False

        try:
            result = subprocess.run(
                ["bash", "lint_check.sh"], capture_output=True, text=True, timeout=60
            )
            passed = result.returncode == 0
            print_check("lint_check.sh", passed, result.stderr[:500] if not passed and result.stderr else "")
            self.results["code_correctness"] = passed
            return passed
        except FileNotFoundError:
            print_check("lint_check.sh", False, "bash not found")
            self.results["code_correctness"] = False
            return False
        except subprocess.TimeoutExpired:
            print_check("lint_check.sh", False, "Timeout after 60s")
            self.results["code_correctness"] = False
            return False

    def check_documentation_sync(self):
        """Layer 2: Documentation sync"""
        print_header("Layer 2: Documentation Sync")

        import shutil
        if not shutil.which('bash'):
            print_check("done_check.sh", False, "bash not available — cannot run doc sync check")
            self.results["documentation_sync"] = False
            return False

        try:
            result = subprocess.run(
                ["bash", "done_check.sh"], capture_output=True, text=True, timeout=30
            )
            passed = result.returncode == 0
            print_check("done_check.sh", passed, result.stderr[:500] if not passed and result.stderr else "")
            self.results["documentation_sync"] = passed
            return passed
        except FileNotFoundError:
            print_check("done_check.sh", False, "bash not found")
            self.results["documentation_sync"] = False
            return False
        except subprocess.TimeoutExpired:
            print_check("done_check.sh", False, "Timeout after 30s")
            self.results["documentation_sync"] = False
            return False

    def check_test_coverage(self):
        """Check test files exist"""
        print_header("Test Coverage")

        test_files = list(Path(".").rglob("test_*.py")) + \
                    list(Path(".").rglob("test_*.js")) + \
                    list(Path(".").rglob("*.test.js")) + \
                    list(Path(".").rglob("*.test.ts"))

        if not test_files:
            print_check("Test files exist", False, "No test files found")
            self.results["test_coverage"] = False
            return False

        print_check("Test files exist", True, f"Found {len(test_files)} test files")
        self.results["test_coverage"] = True
        return True

    def check_single_criterion(self, criterion):
        """Check a single done criterion. Returns (passed, message)."""
        ctype = criterion.get("type")

        if ctype == "file_exists":
            path = Path(criterion["path"])
            exists = path.exists()
            return exists, "" if exists else f"File not found: {criterion['path']}"

        elif ctype == "file_contains":
            path = Path(criterion["path"])
            pattern = criterion["pattern"]
            if not path.exists():
                return False, f"File not found: {criterion['path']}"
            content = path.read_text(encoding='utf-8', errors='replace')
            found = pattern in content
            return found, "" if found else f"Pattern not found in {criterion['path']}: '{pattern}'"

        elif ctype == "file_not_contains":
            path = Path(criterion["path"])
            pattern = criterion["pattern"]
            if not path.exists():
                return True, ""
            content = path.read_text(encoding='utf-8', errors='replace')
            found = pattern in content
            return not found, "" if not found else f"Pattern should NOT be in {criterion['path']}: '{pattern}'"

        elif ctype == "route_registered":
            path = Path(criterion["path"])
            route_pattern = criterion.get("route_pattern", "")
            if not path.exists():
                return False, f"Route file not found: {criterion['path']}"
            content = path.read_text(encoding='utf-8', errors='replace')
            found = bool(re.search(r'fastify\.(post|get|put|delete)\s*\(', content))
            if not found:
                return False, f"No Fastify routes found in {criterion['path']}"
            if route_pattern:
                found = bool(re.search(route_pattern, content, re.IGNORECASE))
                return found, "" if found else f"Route pattern not found in {criterion['path']}"
            return True, ""

        elif ctype == "test_passes":
            cmd = criterion["command"]
            try:
                result = subprocess.run(cmd, shell=True, capture_output=True, timeout=60)
                passed = result.returncode == 0
                return passed, "" if passed else f"Test failed: {cmd}"
            except Exception as e:
                return False, f"Test error: {str(e)}"

        else:
            return False, f"Unknown criterion type: {ctype}"

    def check_feature_completeness(self, feature_id=None):
        """Layer 3: Feature completeness check (verify each criterion)"""
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
                print_check(f"{fid}: {fname}", True, f"{len(criteria)} criteria met")
            else:
                print_check(f"{fid}: {fname}", False, f"{len(criteria)-len(failed_criteria)}/{len(criteria)} criteria met")
                for fc in failed_criteria:
                    print(f"         {Colors.YELLOW}{fc}{Colors.NC}")
                all_passed = False

        self.results["feature_completeness"] = all_passed
        print(f"\n  {Colors.BLUE}Criteria: {passed_criteria}/{total_criteria} passed{Colors.NC}")
        return all_passed

    def run_all_checks(self):
        """Run all verification layers"""
        print_header("INDEPENDENT EVALUATOR")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Working directory: {os.getcwd()}")
        if self.feature_id:
            print(f"Checking feature: {self.feature_id}")
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
            print(f"  All verification layers passed.")
            return 0
        else:
            print(f"{Colors.RED}  VERDICT: FAILING{Colors.NC}")
            print(f"  {total - passed} verification layer(s) failed.")
            return 1


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Independent Evaluator")
    parser.add_argument("--feature", help="Check specific feature ID")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args()

    # Fix Windows console encoding
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    evaluator = Evaluator(verbose=args.verbose, feature_id=args.feature)
    exit_code = evaluator.run_all_checks()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
