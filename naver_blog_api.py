# -*- coding: utf-8 -*-
"""
네이버 블로그 Open API를 통한 자동 포스팅
네이버 개발자센터에서 애플리케이션 등록 필요
https://developers.naver.com/apps/#/register
"""

import requests
import json
import os

# 네이버 API 설정 (여기에 실제 값 입력 필요)
CLIENT_ID = "YOUR_CLIENT_ID"  # 네이버 개발자센터에서 발급
CLIENT_SECRET = "YOUR_CLIENT_SECRET"
BLOG_ID = "qjqtkgkrry"  # 네이버 블로그 아이디

def read_markdown_file(filepath):
    """마크다운 파일 읽기"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    title = ""
    body_lines = []
    
    for line in lines:
        if line.startswith('# ') and not title:
            title = line[2:].strip()
        else:
            body_lines.append(line)
    
    body = '\n'.join(body_lines).strip()
    return title, body

def post_to_naver_blog_api(title, content):
    """네이버 블로그 API로 글 발행"""
    url = "https://openapi.naver.com/blog/writePost.json"
    
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    data = {
        "blogId": BLOG_ID,
        "title": title,
        "contents": content
    }
    
    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ 발행 완료: {title}")
        print(f"   URL: {result.get('postUrl', 'N/A')}")
        return True
    else:
        print(f"❌ 발행 실패: {title}")
        print(f"   상태 코드: {response.status_code}")
        print(f"   응답: {response.text}")
        return False

# 블로그 글 파일 목록
blog_posts = [
    "01-유튜브구독자1000명.md",
    "02-인스타팔로워늘리기.md",
    "03-틱톡조회수올리기.md",
    "04-유튜브수익창출조건.md",
    "05-SNS마케팅실패이유.md"
]

base_path = r"C:\Users\user\Desktop\influx-태성작업\네이버블로그"

def main():
    """메인 함수"""
    print("📝 네이버 블로그 API 자동 포스팅 시작\n")
    
    if CLIENT_ID == "YOUR_CLIENT_ID":
        print("❌ 네이버 개발자센터에서 API 키 발급이 필요합니다.")
        print("   https://developers.naver.com/apps/#/register")
        print("   발급 후 CLIENT_ID, CLIENT_SECRET 수정하세요.")
        return
    
    success_count = 0
    fail_count = 0
    
    for post_file in blog_posts:
        filepath = os.path.join(base_path, post_file)
        
        if not os.path.exists(filepath):
            print(f"⚠️ 파일 없음: {filepath}")
            continue
        
        # 파일 읽기
        title, content = read_markdown_file(filepath)
        print(f"\n처리 중: {title}")
        
        # API 발행
        if post_to_naver_blog_api(title, content):
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\n✅ 완료: {success_count}개 성공, {fail_count}개 실패")

if __name__ == "__main__":
    main()
