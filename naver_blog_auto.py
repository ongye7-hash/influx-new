# -*- coding: utf-8 -*-
"""
네이버 블로그 자동 발행 스크립트
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import os

# 블로그 글 파일 목록
blog_posts = [
    "01-유튜브구독자1000명.md",
    "02-인스타팔로워늘리기.md",
    "03-틱톡조회수올리기.md",
    "04-유튜브수익창출조건.md",
    "05-SNS마케팅실패이유.md"
]

base_path = r"C:\Users\user\Desktop\influx-태성작업\네이버블로그"

def read_markdown_file(filepath):
    """마크다운 파일 읽기 (UTF-8)"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 제목 추출 (첫 번째 # 헤딩)
    lines = content.split('\n')
    title = ""
    body_lines = []
    
    for i, line in enumerate(lines):
        if line.startswith('# ') and not title:
            title = line[2:].strip()
        else:
            body_lines.append(line)
    
    body = '\n'.join(body_lines).strip()
    return title, body

def convert_markdown_to_html(text):
    """간단한 마크다운 → HTML 변환"""
    # 여기서는 기본적인 변환만
    # 실제로는 더 복잡한 변환이 필요할 수 있음
    
    # ## 헤딩 → <h2>
    text = text.replace('##', '\n<h2>').replace('</h2>', '\n</h2>\n')
    
    # **굵게** → <strong>
    import re
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    
    # 링크 [텍스트](URL) → <a href="URL">텍스트</a>
    text = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2">\1</a>', text)
    
    # --- → <hr>
    text = text.replace('---', '<hr>')
    
    # > 인용구 → <blockquote>
    text = re.sub(r'^> (.*?)$', r'<blockquote>\1</blockquote>', text, flags=re.MULTILINE)
    
    # 줄바꿈 → <br>
    text = text.replace('\n\n', '<br><br>')
    
    return text

def post_to_naver_blog(driver, title, body):
    """네이버 블로그에 글 발행"""
    try:
        # 글쓰기 페이지로 이동
        driver.get("https://blog.naver.com/qjqtkgkrry/postwrite")
        time.sleep(3)
        
        # 팝업 처리 (작성 중인 글이 있습니다)
        try:
            cancel_btn = driver.find_element(By.XPATH, "//button[contains(text(), '취소')]")
            cancel_btn.click()
            time.sleep(1)
        except:
            pass
        
        # iframe으로 전환
        iframe = driver.find_element(By.TAG_NAME, "iframe")
        driver.switch_to.frame(iframe)
        
        # 제목 입력
        title_input = driver.find_element(By.XPATH, "//p[contains(text(), '제목')]")
        title_input.click()
        title_input.clear()
        title_input.send_keys(title)
        time.sleep(1)
        
        # 본문 입력
        body_input = driver.find_element(By.XPATH, "//p[contains(text(), '글감과 함께')]")
        body_input.click()
        body_input.clear()
        
        # HTML 변환된 본문 입력
        html_body = convert_markdown_to_html(body)
        driver.execute_script(f"arguments[0].innerHTML = `{html_body}`;", body_input)
        time.sleep(2)
        
        # iframe에서 나오기
        driver.switch_to.default_content()
        
        # 발행 버튼 클릭
        publish_btn = driver.find_element(By.XPATH, "//button[contains(text(), '발행')]")
        publish_btn.click()
        time.sleep(3)
        
        # 발행 확인 (카테고리 선택 등)
        try:
            confirm_btn = driver.find_element(By.XPATH, "//button[contains(text(), '발행') or contains(text(), '확인')]")
            confirm_btn.click()
            time.sleep(3)
        except:
            pass
        
        print(f"✅ 발행 완료: {title}")
        return True
        
    except Exception as e:
        print(f"❌ 발행 실패: {title} - {str(e)}")
        return False

def main():
    """메인 함수"""
    # Chrome 옵션 설정
    options = Options()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Chrome 드라이버 실행 (새 세션, 프로필 충돌 없음)
    driver = webdriver.Chrome(options=options)
    
    try:
        # 네이버 블로그 로그인 페이지
        driver.get("https://nid.naver.com/nidlogin.login")
        print("⏳ 30초 안에 네이버 로그인을 완료해주세요...")
        time.sleep(30)  # 수동 로그인 대기
        
        # 로그인 완료 확인
        driver.get("https://blog.naver.com")
        time.sleep(3)
        
        # 각 블로그 글 발행
        for post_file in blog_posts:
            filepath = os.path.join(base_path, post_file)
            
            if not os.path.exists(filepath):
                print(f"⚠️ 파일 없음: {filepath}")
                continue
            
            # 파일 읽기
            title, body = read_markdown_file(filepath)
            print(f"\n📝 처리 중: {title}")
            
            # 블로그 발행
            success = post_to_naver_blog(driver, title, body)
            
            if success:
                time.sleep(5)  # 각 글 사이 대기
            else:
                print(f"⏭️ 스킵: {title}")
                continue
        
        print("\n✅ 모든 글 발행 완료!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
    
    finally:
        time.sleep(10)
        driver.quit()

if __name__ == "__main__":
    main()
