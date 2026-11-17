"""
Convenience launcher for recovery model training.
Enables running `python scripts/train_recovery_model.py` directly from `tracker/`.
Automatically delegates to backend/.venv/Scripts/python.exe if available.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

TARGET = Path(__file__).resolve().parent.parent / "backend" / "scripts" / "train_recovery_model.py"
VENV_PYTHON = Path(__file__).resolve().parent.parent / "backend" / ".venv" / "Scripts" / "python.exe"

if not TARGET.exists():
    sys.stderr.write(f"Target script not found: {TARGET}\n")
    sys.exit(1)

# If virtualenv python exists and we're not running it, delegate to it
if VENV_PYTHON.exists() and Path(sys.executable).resolve() != VENV_PYTHON.resolve():
    res = subprocess.run([str(VENV_PYTHON), str(TARGET)] + sys.argv[1:])
    sys.exit(res.returncode)

import runpy
backend_dir = TARGET.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

runpy.run_path(str(TARGET), run_name="__main__")
