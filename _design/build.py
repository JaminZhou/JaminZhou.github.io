#!/usr/bin/env python3
"""Compatibility entry point; preview now comes from the production Node builders."""
from pathlib import Path
import subprocess
raise SystemExit(subprocess.run(['npm','run','build:preview'],cwd=Path(__file__).resolve().parent.parent).returncode)
