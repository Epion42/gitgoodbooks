import subprocess
import sys

files = subprocess.check_output(["git", "ls-files", "-z"]).decode().split("\0")
errors = []

for filename in filter(None, files):
    result = subprocess.run(
        ["git", "show", f"HEAD:{filename}"],
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    if result.returncode != 0:
        continue
    content = result.stdout

    # Skip binary files
    if b"\0" in content:
        continue

    if b"\r\n" in content:
        errors.append(f"{filename}: contains CRLF line endings")

    # If we want to enforce newline at EOF
    # if content and not content.endswith(b"\n"):
    #     errors.append(f"{filename}: missing final newline")

if errors:
    print("Line ending errors detected:\n")
    for error in errors:
        print(f"  - {error}")
    sys.exit(1)

print("All files have valid line endings.")
