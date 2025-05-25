from flask import Flask, request, redirect, url_for, render_template, session, jsonify
from werkzeug.utils import secure_filename  # 파일 이름을 안전하게 다루기 위한 모듈
import os  # 파일 경로 등을 다루기 위한 표준 모듈

import uuid  # 고유한 ID를 만들기 위한 모듈
import pymysql  # MySQL 데이터베이스에 접속하기 위한 라이브러리 (for 일부 작업)

from werkzeug.security import generate_password_hash, check_password_hash  # 비밀번호 해싱과 검증을 위한 모듈
import mysql.connector  # MySQL 데이터베이스 접속을 위한 또 다른 라이브러리 (메인 DB 연결용)
# CORS(Cross-Origin Resource Sharing)를 허용하기 위한 모듈
from flask_cors import CORS
import requests  # HTTP 요청을 보내기 위한 requests 모듈 불러오기
from urllib.parse import urlencode  # URL 인코딩을 위한 urlencode 함수 불러오기


# Flask 앱 객체 생성
app = Flask(__name__)
app.secret_key = '235701'  # 세션에 필요한 비밀키 설정

# 프로필 사진 저장 폴더 설정
UPLOAD_FOLDER = 'static\\profile_pics'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER  # Flask 설정에 저장

# 피드별로 이미지 폴더를 저장할 상위 디렉토리 이름 설정
UPLOAD_FOLDER2 = 'feed_folders'
# 해당 폴더가 존재하지 않으면 생성
os.makedirs(UPLOAD_FOLDER2, exist_ok=True)

# MySQL 데이터베이스 연결 설정
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="***",
    database="userdb"
)
# 데이터베이스 커서 생성 (dictionary=True 옵션: 결과를 딕셔너리 형태로 반환)
cursor2 = db.cursor(dictionary=True)

conn = mysql.connector.connect(
    host="localhost",       # MySQL 호스트명 (로컬호스트)
    user="root",            # MySQL 사용자명
    password="***",  # MySQL 비밀번호
    database="feeds"        # 사용할 데이터베이스 이름
)
# 전역 커서 생성 (CRUD 실행에 사용)
cursor1 = conn.cursor()

# 기본 페이지 ('/') : 회원가입 및 로그인 페이지 렌더링
@app.route('/register_and_login')
def index1():
    return render_template('register_and_login.html')

@app.route("/")
def index():
    return render_template("Home.html")  # templates 폴더 내의 HTML 파일 렌더링

# 회원가입 처리 라우트
@app.route('/register', methods=['POST'])
def register():
    # 폼으로부터 입력된 데이터 가져오기
    user_id = request.form['user_id']
    password = request.form['password']
    nickname = request.form['nickname']

    # 비밀번호를 해싱하여 저장
    hashed_pw = generate_password_hash(password)
    # 사용자 고유 UUID 생성
    user_uuid = str(uuid.uuid4())

    try:
        # users 테이블에 새 사용자 정보 삽입
        cursor2.execute(
            "INSERT INTO users (id, user_id, password, nickname) VALUES (%s, %s, %s, %s)",
            (user_uuid, user_id, hashed_pw, nickname)
        )
        db.commit()  # 변경사항 저장
        return redirect(url_for('login'))  # 회원가입 성공 후 로그인 페이지로 이동
    except mysql.connector.IntegrityError:
        # 이미 존재하는 아이디일 경우 예외 처리
        return "이미 존재하는 아이디입니다."

# 로그인 처리 라우트
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # 폼에서 입력된 아이디와 비밀번호 가져오기
        user_id = request.form['user_id']
        password = request.form['password']

        # 입력된 아이디로 사용자 정보 조회
        cursor2.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        user = cursor2.fetchone()

        if user:
            stored_password_hash = user['password']
            # 저장된 해시 비밀번호와 입력 비밀번호 비교
            if check_password_hash(stored_password_hash, password):
                # 비밀번호 일치 시 세션에 사용자 ID 저장
                session['user_id'] = user['id']
                return redirect(url_for('profile'))  # 프로필 페이지로 이동
            else:
                return "❌ 비밀번호가 틀렸습니다."
        else:
            return "❌ 아이디가 존재하지 않습니다."
    return render_template('login.html')  # GET 요청 시 로그인 페이지 렌더링

# 별도로 DB 연결을 새로 생성하는 함수 (파일 업로드 등에서 사용)
def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='***',
        db='userdb',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

# 프로필 사진 업로드 처리 라우트
@app.route('/upload_profile_pic', methods=['POST'])
def upload_profile_pic():

    if 'user_id' not in session:
        return redirect('/login')  # 로그인하지 않은 경우 로그인 페이지로 이동

    file = request.files['profile_pic']  # 업로드된 파일 가져오기

    if file and file.filename != '':  # 파일이 정상적으로 존재하는지 확인
        filename = secure_filename(file.filename)  # 파일명을 안전하게 변환

        ext = os.path.splitext(filename)[1]  # 파일 확장자 추출
        unique_name = str(uuid.uuid4()) + ext  # 고유한 파일명 생성

        save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)  # 저장할 전체 경로 설정
        file.save(save_path)  # 서버에 파일 저장
        profile_img_web_path = f"profile_pics/{unique_name}"  # 웹에서 접근할 경로 설정

        # 새로 만든 DB 연결 사용
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 해당 사용자의 profile_img_url 업데이트
            sql = "UPDATE users SET profile_img_url = %s WHERE id = %s"
            cursor.execute(sql, (save_path, session['user_id']))
            conn.commit()  # 변경사항 저장
        conn.close()  # DB 연결 종료

    return redirect(url_for('profile'))  # 파일 업로드 후 프로필 페이지로 이동

# 프로필 소개 문구를 업데이트할 때 호출되는 라우트 설정 (POST 메서드만 허용)
@app.route('/update_intro', methods=['POST'])
def update_intro():
    # 세션에 'user_id'가 없으면(로그인하지 않은 경우) 로그인 페이지로 리디렉션
    if 'user_id' not in session:
        return redirect('/login')

    # 클라이언트(브라우저)에서 전송한 폼 데이터 중 'intro_text' 필드를 가져옴
    intro_text = request.form['intro_text']

    # 데이터베이스 연결 생성
    conn = get_db_connection()

    # 데이터베이스 커서를 열고 SQL 쿼리를 실행
    with conn.cursor() as cursor:
        # 현재 로그인한 사용자의 'intro_text' 컬럼을 새로 입력받은 값으로 업데이트하는 SQL 쿼리 작성
        sql = "UPDATE users SET intro_text = %s WHERE id = %s"
        # SQL 쿼리를 실행하면서, intro_text와 user_id 값을 전달하여 안전하게 업데이트
        cursor.execute(sql, (intro_text, session['user_id']))
        # 변경사항을 데이터베이스에 확정(commit)하여 저장
        conn.commit()

    # 커서 작업이 끝났으므로 데이터베이스 연결 종료
    conn.close()

    # 프로필 페이지로 리디렉션하여 업데이트된 소개 문구를 확인할 수 있도록 함
    return redirect(url_for('profile'))

# 프로필 페이지에 접근할 때 호출되는 라우트 설정
@app.route('/profile')
def profile():
    # 세션에 'user_id'가 없으면(로그인하지 않은 경우) 로그인 페이지로 리디렉션
    if 'user_id' not in session:
        return redirect('/login')

    # 데이터베이스 연결 생성
    conn = get_db_connection()

    # 데이터베이스 연결로 커서를 생성하고 SQL 쿼리를 실행
    with conn.cursor() as cursor:
        # 현재 로그인한 사용자의 닉네임, 프로필 이미지 URL, 소개 문구를 가져오는 쿼리 작성
        sql = "SELECT nickname, profile_img_url, intro_text FROM users WHERE id = %s"
        # SQL 쿼리 실행: 세션에 저장된 user_id를 사용하여 해당 사용자 정보 조회
        cursor.execute(sql, (session['user_id'],))
        # 쿼리 결과를 하나 가져옴 (하나의 사용자 데이터)
        user = cursor.fetchone()

    # 커서 작업이 끝났으니 데이터베이스 연결 종료
    conn.close()

    # 사용자의 프로필 이미지 URL이 존재할 경우
    if user['profile_img_url']:
        # 경로 문자열에서 'static/' 부분을 제거하고, 백슬래시를 슬래시로 변환하여 웹 경로에 적합하게 수정
        profile_img_url = user['profile_img_url'].replace('static/', '').replace('\\', '/')
    else:
        # 프로필 이미지가 없는 경우 기본 프로필 이미지를 사용 (기본 이미지 경로 설정)
        profile_img_url = 'static\\profile_pics\\a7a4c0ca-ed78-4d12-91e7-7c7cb5b87d14.jpg'

    # 사용자의 소개 문구가 존재할 경우 그 값을 사용하고, 없으면 빈 문자열로 설정
    intro_text = user['intro_text'] if user['intro_text'] else ''

    # profile.html 템플릿을 렌더링하면서 가져온 닉네임, 프로필 이미지 URL, 소개 문구를 전달
    return render_template('profile.html', nickname=user['nickname'], profile_img_url=profile_img_url, intro_text=intro_text)

@app.route('/delete_account', methods=['POST'])
def delete_account():
    user_id = session.get('id')  # 세션에서 사용자 고유 UUID 가져오기
    if not user_id:
        return redirect(url_for('Home'))  # 로그인 상태 아니면 홈으로

    # DB에서 해당 사용자 정보 삭제
    cursor2.execute("DELETE FROM users WHERE id = %s", (user_id,))
    db.commit()  # 변경사항 저장

    session.clear()  # 세션 초기화 (로그아웃 처리)
    return redirect(url_for('Home'))  # 홈 페이지로 이동


# 로그아웃
@app.route('/logout')  # 로그아웃 라우트
def logout():
    session.clear()  # 세션 데이터 삭제
    return redirect(url_for('Home'))  # 홈 페이지로 리디렉션

# 피드 추가 요청을 처리하는 API 엔드포인트
@app.route("/add_feed", methods=["POST"])
def add_feed():
    # 클라이언트에서 전송된 JSON 데이터를 파싱
    data = request.json
    # 위도, 경도, 피드 설명 텍스트 추출
    lat = data.get("lat")
    lng = data.get("lng")
    intro = data.get("feed_introduction", "")

    try:
        # UUID를 이용해 고유 피드 ID 생성
        feed_id = str(uuid.uuid4())
        # feed_id 이름의 개별 폴더 생성 경로 지정
        folder_name = os.path.join(UPLOAD_FOLDER2, feed_id)
        # 해당 폴더가 존재하지 않으면 생성
        os.makedirs(folder_name, exist_ok=True)

        # 절대 경로를 상대 경로로 변환하여 DB에 저장
        relative_path = os.path.relpath(folder_name, start=os.getcwd())

        # 피드 정보를 feed 테이블에 INSERT
        cursor1.execute("""
            INSERT INTO feed (feed_id, latitude, longitude, feed_introduction, feed_pictures)
            VALUES (%s, %s, %s, %s, %s)
        """, (feed_id, lat, lng, intro, relative_path))
        # 변경사항을 DB에 커밋
        conn.commit()

        # 저장 성공 메시지를 JSON으로 반환
        return jsonify({"success": True, "feed_id": feed_id}),200  # 성공 응답 코드 200
    except Exception as e:
        # 예외 발생 시 에러 메시지 출력 및 실패 응답 반환
        print("❌ DB 저장 오류:", e)
        return jsonify({"success": False, "message": str(e)}),500  # 실패 응답 코드 500

# 클라이언트가 기존 피드 목록을 요청할 때 사용하는 GET API
@app.route('/get_feeds', methods=['GET'])
def get_feeds():
    # 결과를 딕셔너리 형태로 받기 위해 cursor 설정
    cursor1 = conn.cursor(dictionary=True)
    # 피드 테이블에서 위도, 경도, 설명을 선택하여 조회
    cursor1.execute("SELECT latitude AS lat, longitude AS lng, feed_introduction FROM feed")
    # 모든 결과를 리스트 형태로 저장
    feeds = cursor1.fetchall()
    # JSON 형식으로 응답 반환
    return jsonify(success=True, feeds=feeds)  # ✅ success 필드를 명시적으로 포함

# 앱 실행 (디버그 모드로 실행하여 수정사항 즉시 반영)
if __name__ == '__main__':
    app.run(debug=True)