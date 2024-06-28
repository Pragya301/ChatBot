import asyncio
import logging
import sqlite3
from flask import Flask, request, render_template, jsonify
from rasa.core.agent import Agent
from flask_cors import CORS
import re
import uuid

# #_________Load_model_________##############################################################################################################################################

# model_path = "D:\\chat-bot\\chat-bot\\model\\testing.tar.gz"
# DATABASE_PATH = "database\\DB.db"

app = Flask(__name__,template_folder="public",static_folder="src")
CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# agent = Agent.load(model_path)

# #________DataBasecode________##############################################################################################################################################

# class DatabaseConnection:
#     def __init__(self):
#         self.conn = None

#     def __enter__(self):
#         self.conn = sqlite3.connect(DATABASE_PATH)
#         self.create_tables()
#         return self.conn.cursor()

#     def create_tables(self):
#         with self.conn:
#             self.conn.execute('''
#                 CREATE TABLE IF NOT EXISTS user_details (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     user_id INTEGER UNIQUE NOT NULL,
#                     user_name TEXT,
#                     user_email TEXT
#                 )
#             ''')

#             self.conn.execute('''
#                 CREATE TABLE IF NOT EXISTS chat_logs (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     user_id INTEGER,
#                     user_input TEXT,
#                     bot_response TEXT
#                 )
#             ''')

#             self.conn.execute('''
#                 CREATE TABLE IF NOT EXISTS feedback (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     user_id INTEGER,
#                     feedback_message TEXT
#                 )
#             ''')
#             self.update_table_columns('user_details', ['user_name', 'user_email'])
#             self.update_table_columns('chat_logs', ['user_input', 'bot_response'])

#     def update_table_columns(self, table_name, columns):
#         existing_columns = [col[1] for col in self.conn.execute(f"PRAGMA table_info('{table_name}')")]
#         for column in columns:
#             if column not in existing_columns:
#                 self.conn.execute(f'ALTER TABLE {table_name} ADD COLUMN {column} TEXT')

#     def __exit__(self, exc_type, exc_value, traceback):
#         try:
#             if exc_type is not None:
#                 logger.error(f"An error occurred during database operation: {str(exc_type)} - {str(exc_value)}")

#         finally:
#             try:
#                 self.conn.commit()
#             except Exception as e:
#                 logger.error(f"Error committing changes to the database: {str(e)}")

#             try:
#                 self.conn.close()
#             except Exception as e:
#                 logger.error(f"Error closing the database connection: {str(e)}")

# def generate_unique_user_id():
#     return str(uuid.uuid4())

# def get_user_data(request_data):
#     user_name = request_data.get('user_name', '')
#     user_email = request_data.get('user_email', '')
#     return user_name, user_email

# def is_valid_email(email):
#     pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
#     return re.search(pattern, email) is not None

@app.route('/')
def index():
    return render_template("index.html")


# #_____start_chat_code__________########################################################################################################################################

# @app.route('/New_user', methods=['POST'])
# def new_user():
#     try:
#         data = request.json
#         user_id = data.get('user_id')
#         user_name = data.get('user_name')
#         user_email = data.get('user_email')

#         if user_id:
#             # User provided user_id, check in the database
#             with DatabaseConnection() as cursor:
#                 cursor.execute('SELECT user_name FROM user_details WHERE user_id = ?', (user_id,))
#                 user_name_result = cursor.fetchone()

#                 if user_name_result:
#                     return jsonify({'message': f"Hello, {user_name_result[0]}, how can I help you today?"})

#         if not user_name or not user_email:
#             return jsonify({'error': "Please provide both your name and email."}), 400

#         if not is_valid_email(user_email):
#             return jsonify({'error': "Invalid email. Please provide a valid email address."}), 400

#         with DatabaseConnection() as cursor:
#             cursor.execute('SELECT user_id FROM user_details WHERE user_name = ? AND user_email = ?', (user_name, user_email))
#             existing_user_id = cursor.fetchone()

#             if existing_user_id:
#                 return jsonify({'message': f"Hello, {user_name}, how can I help you today?"})
#             else:
#                 unique_user_id = generate_unique_user_id()
#                 cursor.execute('INSERT INTO user_details (user_id, user_name, user_email) VALUES (?, ?, ?)',
#                                (unique_user_id, user_name, user_email))
#                 return jsonify({'user_id': unique_user_id, 'message': f"Welcome, {user_name}! I'm here to help. Feel free to ask me anything."})

#     except Exception as e:
#         error_message = f"An error occurred: {str(e)}"
#         return jsonify({'error': error_message}), 500
    
# #_____start_chat_code__________########################################################################################################################################

# @app.route('/start_chat', methods=['POST'])
# def start_chat():
    
#     try:
#         data = request.json
#         user_name, user_email = get_user_data(data)

#         if not user_name or not user_email:
#             return jsonify({'error': "Please provide both your email and name."}), 400

#         if not is_valid_email(user_email):  
#             return jsonify({'error': "Invalid email. Please provide a valid email address."}), 400

#         with DatabaseConnection() as cursor:
#             cursor.execute('SELECT user_id FROM user_details WHERE user_name = ? AND user_email = ?', (user_name, user_email))
#             existing_user_id = cursor.fetchone()

#             if existing_user_id:
#                 bot_response = "How can I assist you today?"
#                 return jsonify({'message': f"Hey, {user_name} " + bot_response, 'user_id': existing_user_id[0]})
#             else:
#                 # Check if the email already exists with a different name
#                 cursor.execute('SELECT user_id FROM user_details WHERE user_email = ?', (user_email,))
#                 existing_user_id_by_email = cursor.fetchone()

#                 unique_user_id = None  
#                 if existing_user_id:
#                     bot_response = "How can I assist you today?"
#                     return jsonify({'message': f"Hey, {user_name} " + bot_response, 'user_id': existing_user_id[0]})
#                 else:
#                     unique_user_id = generate_unique_user_id()
#                     bot_response = "Welcome! I'm here to help. Feel free to ask me anything."
#                     cursor.execute('INSERT INTO user_details (user_id, user_name, user_email) VALUES (?, ?, ?)',
#                                 (unique_user_id, user_name, user_email))
#                     return jsonify({'user_id': unique_user_id, 'message': f"Hey, {user_name} " + bot_response})

#     except Exception as e:
#         error_message = f"An error occurred: {str(e)}"
#         return jsonify({'error': error_message}), 500
 
# #______main_chat_code__________########################################################################################################################################
    
# @app.route('/webhook', methods=['POST'])
# def webhook():
#     try:
#         data = request.json
#         user_input = data.get('message', {}).get('text', '')
#         user_email = data.get('user_email', '')

#         print("Received request with user_email:", user_email)

#         if not user_email:
#             return jsonify({'error': "Please provide a user email."}), 400

#         with DatabaseConnection() as cursor:
#             cursor.execute('SELECT user_id FROM user_details WHERE user_email = ?', (user_email,))
#             user_id = cursor.fetchone()
#             user_id = user_id[0] if user_id else None

#             cursor.execute('INSERT INTO chat_logs (user_id, user_input, bot_response) VALUES (?, ?, ?)',
#                            (user_id, user_input, ''))

#             response = asyncio.run(agent.handle_text(user_input))
#             bot_response = response[0]['text'] if response and response[0].get('text') else "Sorry, I couldn't understand that."

#             # Update the INSERT statement to include bot_response
#             cursor.execute('INSERT INTO chat_logs (user_id, user_input, bot_response) VALUES (?, ?, ?)',
#                            (user_id, user_input, bot_response))

#             buttons = []
#             if user_input.lower() == 'help':
#                 buttons = ['Information', 'Enquiry', 'Student Help', 'Complaint', 'Support']
#             elif user_input.lower() == 'information':
#                 buttons = ['Information', 'Enquiry']
#             elif user_input.lower() == 'student help':
#                 buttons = ['Mother name correction', 'Father name correction', 'DOB correction', 'Migration correction']

#             if user_input.lower() in ['help', 'information', 'student help']:
#                 return jsonify({'user_id': user_id, 'buttons': buttons})
            

#             else:
#                 return jsonify({'user_id': user_id, 'message': bot_response})

#     except sqlite3.Error as e:
#         error_message = f"SQLite database error occurred: {str(e)}"
#         return jsonify({'error': error_message}), 500

#     except Exception as e:
#         error_message = f"An error occurred: {str(e)}"
#         return jsonify({'error': error_message}), 500

# #______# database for corrections____###################################################################################################################################    

# def create_corrections_table():
#     with DatabaseConnection() as cursor:
#         cursor.execute('''
#             CREATE TABLE IF NOT EXISTS corrections (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 user_id INTEGER NOT NULL,
#                 college_name TEXT,
#                 college_code TEXT,
#                 branch TEXT,
#                 year INTEGER,
#                 semester INTEGER,
                
#                 wrong_mother_name TEXT,
#                 correct_mother_name TEXT,
                       
#                 wrong_father_name TEXT,
#                 correct_father_name TEXT,

#                 wrong_dob TEXT,
#                 correct_dob TEXT,
                       
#                 migrated_from TEXT, 
#                 migrated_to TEXT, 
                       
#                 FOREIGN KEY (user_id) REFERENCES user_details(user_id)
#             )
#         ''')

# #______Feedback_Function____##########################################################################################################################################

# @app.route('/feedback', methods=['POST'])
# def handle_feedback():
    # try:
    #     data = request.json
    #     user_id = data.get('user_id', '')
    #     feedback_message = data.get('feedback_message', '')
        
    #     if not user_id or not feedback_message:
    #         return jsonify({'error': "Please provide both user_id and feedback_message."}), 400

    #     with DatabaseConnection() as cursor:
    #         cursor.execute('INSERT INTO feedback (user_id, feedback_message) VALUES (?, ?)',
    #                        (user_id, feedback_message))

    #     return jsonify({'message': 'Thank you for your feedback!'}), 200

    # except Exception as e:
    #     return jsonify({'error': f"An error occurred: {str(e)}"}), 500
    

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)