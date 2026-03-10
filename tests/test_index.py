import re
from playwright.sync_api import Page, expect
import pytest

from pathlib import Path

file_url = Path('index.html').resolve().as_uri()

@pytest.fixture
def root(page: Page):
    page.goto(f"{file_url}#")
    return page


def test_page_title(root):
    expect(root).to_have_title('Emoji Picker')


def test_search_and_copy(root):
    q = root.locator('#q')
    q.fill('grinning')
    # wait for results
    root.wait_for_selector('#results li button')
    first = root.locator('#results li button').first
    expect(first).to_have_text(re.compile('grinning', re.I))

