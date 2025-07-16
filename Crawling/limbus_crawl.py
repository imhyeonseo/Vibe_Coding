import requests
from bs4 import BeautifulSoup
import pandas as pd

# 나무위키 Limbus Company 페이지 크롤링
url = "https://namu.wiki/w/Limbus%20Company"
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

print("페이지 크롤링 시작...")
response = requests.get(url, headers=headers)
soup = BeautifulSoup(response.content, 'html.parser')

print(f"응답 코드: {response.status_code}")
print(f"페이지 제목: {soup.title.text if soup.title else 'N/A'}")

# 인격 관련 데이터 추출
identity_data = []
all_data = []

# 모든 테이블 검사
tables = soup.find_all('table')
print(f"\n총 {len(tables)}개의 테이블 발견")

for i, table in enumerate(tables):
    table_text = table.get_text()
    
    # 인격 관련 테이블 찾기
    if any(keyword in table_text for keyword in ['인격', '등급', '★', 'Identity']):
        print(f"\n=== 테이블 {i+1} (인격 관련) ===")
        
        rows = table.find_all('tr')
        table_data = []
        
        for j, row in enumerate(rows):
            cells = row.find_all(['td', 'th'])
            row_data = [cell.get_text().strip() for cell in cells]
            
            if any(row_data):  # 빈 행이 아닌 경우
                table_data.append(row_data)
                all_data.append(row_data)
                
                if j < 5:  # 처음 5행만 출력
                    print(f"  {j+1}: {row_data}")
        
        identity_data.extend(table_data)

print(f"\n총 {len(all_data)}개의 데이터 행 추출")

# 데이터 저장
if all_data:
    # 최대 컬럼 수 계산
    max_cols = max(len(row) for row in all_data)
    
    # 모든 행을 같은 길이로 맞춤
    normalized_data = []
    for row in all_data:
        normalized_row = row + [''] * (max_cols - len(row))
        normalized_data.append(normalized_row)
    
    # DataFrame 생성
    columns = [f'컬럼_{i+1}' for i in range(max_cols)]
    df = pd.DataFrame(normalized_data, columns=columns)
    
    # CSV 저장
    df.to_csv('limbus_company_data.csv', index=False, encoding='utf-8-sig')
    print(f"\nCSV 파일 저장 완료: {df.shape}")
    print("\n=== 데이터 미리보기 ===")
    print(df.head(10))
    
else:
    print("추출된 데이터가 없습니다.")

# 추가로 전체 텍스트에서 인격 관련 내용 추출
print("\n=== 텍스트 기반 추출 ===")
all_text = soup.get_text()
lines = [line.strip() for line in all_text.split('\n') if line.strip()]

identity_lines = []
for line in lines:
    if any(keyword in line for keyword in ['★★★', '★★', '★', '등급']) and len(line) < 100:
        identity_lines.append(line)

print(f"인격 관련 텍스트 {len(identity_lines)}개 발견")
for i, line in enumerate(identity_lines[:15]):
    print(f"{i+1}: {line}")

# 텍스트 파일로 저장
with open('limbus_company_text.txt', 'w', encoding='utf-8') as f:
    for line in identity_lines:
        f.write(line + '\n')

print(f"\n완료! 파일 저장:")
print("- limbus_company_data.csv (테이블 데이터)")
print("- limbus_company_text.txt (텍스트 데이터)")