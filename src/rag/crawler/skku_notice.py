from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
from urllib.parse import urljoin, urlparse, parse_qs
from langchain_core.documents import Document

BASE_URL = "https://www.skku.edu/skku/campus/skk_comm/notice01.do"


def crawl_notices(
    max_pages: int = 30,
    delay: int = 2,
    existing_post_nums=None,
):
    """
    성균관대 대표 홈페이지 공지사항 크롤링
    (https://www.skku.edu/skku/campus/skk_comm/notice01.do)
    """
    if existing_post_nums is None:
        existing_post_nums = set()

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    notices = []
    article_limit = 10  # 페이지당 게시글 개수

    for page_num in range(max_pages):
        offset = page_num * article_limit
        list_url = (
            f"{BASE_URL}?mode=list&articleLimit={article_limit}"
            f"&article.offset={offset}"
        )

        print(f"\n=== Crawling page {page_num + 1}/{max_pages} (offset: {offset}) ===")
        driver.get(list_url)
        time.sleep(delay)

        soup = BeautifulSoup(driver.page_source, "html.parser")

        # 🔥 셀렉터 완전 완화: articleNo= 만 포함된 링크 모두
        anchors = soup.select("a[href*='articleNo=']")

        print(f"  Found {len(anchors)} <a> with articleNo=")
        if not anchors:
            # 디버깅용: a 태그 몇 개 출력해보기
            all_as = soup.select("a")
            print(f"  Total <a> tags on page: {len(all_as)}")
            for a in all_as[:30]:
                print("TEXT:", a.get_text(strip=True))
                print("HREF:", a.get("href"))
                print("ONCLICK:", a.get("onclick"))
                print("-" * 40)
            print("No more notice links found, stopping.")
            break

        page_notices = []

        for a in anchors:
            href = a.get("href", "").strip()
            if not href:
                continue

            title = a.get_text(strip=True)
            link = urljoin(BASE_URL, href)

            # articleNo 추출
            parsed = urlparse(link)
            qs = parse_qs(parsed.query)
            article_no = qs.get("articleNo", [None])[0]

            post_id = article_no or link

            if post_id in existing_post_nums:
                print(f"  → Skipping (already crawled): {title}")
                continue

            page_notices.append(
                {
                    "post_id": post_id,
                    "title": title,
                    "link": link,
                }
            )
            existing_post_nums.add(post_id)

        print(f"  New items on page: {len(page_notices)}")

        # 상세 페이지 크롤링
        for idx, notice_info in enumerate(page_notices, 1):
            print(f"  [{idx}/{len(page_notices)}] Crawling: {notice_info['title']}")
            body, meta = crawl_notice_body(driver, notice_info["link"], delay=delay)

            notices.append(
                {
                    "post_id": notice_info["post_id"],
                    "post_num": notice_info["post_id"],
                    "title": notice_info["title"],
                    "link": notice_info["link"],
                    "body": body,
                    "category": meta.get("category"),
                    "date": meta.get("date"),
                    "department": meta.get("department"),
                }
            )
            print(f"    ✓ Completed ({notice_info['post_id']})")

    driver.quit()
    print("\n=== Crawling completed ===")
    print(f"Total notices crawled: {len(notices)}")
    return notices


def crawl_notice_body(driver, link: str, delay: int = 1):
    """상세 페이지 본문 & 메타데이터 크롤링"""
    driver.get(link)
    time.sleep(delay)
    soup = BeautifulSoup(driver.page_source, "html.parser")

    # 본문
    content_container = soup.select_one(
        "div.brd-view-con, div.bbs-view-cont, "
        "div.board-view-contents, div.bv_cont"
    )

    if content_container:
        body = content_container.get_text("\n", strip=True)
    else:
        full_text = soup.get_text("\n", strip=True)
        if "게시글 내용" in full_text:
            body = full_text.split("게시글 내용", 1)[1].strip()
        else:
            body = full_text

    # 메타데이터 대충 파싱
    text = soup.get_text("\n", strip=True)
    category = None
    date = None
    department = None

    for line in text.splitlines():
        line = line.strip()
        if "[" in line and "]" in line and "최종 수정일" in line:
            category = line.split("]", 1)[0].lstrip("[").strip()
            if "최종 수정일" in line:
                tail = line.split("최종 수정일", 1)[1]
                tail = tail.replace(":", " ").strip()
                parts = tail.split()
                if parts:
                    date = parts[0]

        if department is None and (
            "학과" in line
            or "팀" in line
            or "대학" in line
            or "센터" in line
        ):
            department = line

    meta = {"category": category, "date": date, "department": department}
    return body, meta


def notices_to_documents(notices):
    """LangChain Document로 변환"""
    docs = []
    for n in notices:
        body = n.get("body", "")
        docs.append(
            Document(
                page_content=body,
                metadata={
                    "title": n.get("title", ""),
                    "post_id": n.get("post_id", ""),
                    "link": n.get("link", ""),
                    "category": n.get("category", ""),
                    "date": n.get("date", ""),
                    "department": n.get("department", ""),
                    "source": "SKKU_NOTICE_MAIN",
                },
            )
        )
    return docs


if __name__ == "__main__":
    existing_ids = set()

    notices = crawl_notices(
        max_pages=2,
        delay=2,
        existing_post_nums=existing_ids,
    )

    docs = notices_to_documents(notices)

    print("\n=== Documents Summary ===")
    print(f"Total documents created: {len(docs)}")

    for i, doc in enumerate(docs[:3], 1):
        print(f"\n--- Document {i} ---")
        print(f"Title: {doc.metadata.get('title')}")
        print(f"Date: {doc.metadata.get('date')}")
        print(f"Category: {doc.metadata.get('category')}")
        print(f"Department: {doc.metadata.get('department')}")
        print(f"Post ID: {doc.metadata.get('post_id')}")
        print(f"Link: {doc.metadata.get('link')}")
        print(f"Content preview: {doc.page_content[:150]}...")
