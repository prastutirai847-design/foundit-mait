import re

from fastapi import Depends, Header, HTTPException, status

# This is a demo identity, not authentication. Any client can choose an
# identifier with the X-Demo-User header. The backend still enforces ownership
# against that identifier so the reporter/claimant workflows behave correctly.
DEMO_USER_HEADER = "X-Demo-User"
DEMO_USER_PATTERN = re.compile(r"^[A-Za-z0-9_-]{3,40}$")


def get_demo_user(
    x_demo_user: str | None = Header(default=None, alias=DEMO_USER_HEADER),
) -> str | None:
    if x_demo_user is None or not x_demo_user.strip():
        return None

    value = x_demo_user.strip()
    if not DEMO_USER_PATTERN.fullmatch(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "X-Demo-User must be 3-40 characters using letters, numbers, "
                "underscores or hyphens."
            ),
        )
    return value


def require_demo_user(
    demo_user: str | None = Depends(get_demo_user),
) -> str:
    if demo_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "This demo action needs an X-Demo-User header. "
                "The React app sends demo-me automatically."
            ),
        )
    return demo_user
