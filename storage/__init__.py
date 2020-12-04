import sqlite3
from pathlib import Path
from werkzeug.security import check_password_hash, generate_password_hash
from entities import User, Task

# Подключаемся к БД
db_path = '/'.join([str(Path(__file__).parent), '..', 'db', 'database.sqlite'])
db = sqlite3.connect(db_path, check_same_thread=False)


class Storage:
    @staticmethod
    def add_user(user: User):
        """обавление пользователя
        :param user:    новый пользователь
        :type user:     User"""
        db.execute('INSERT INTO users (email, password) VALUES (?, ?)',
                   (user.email, generate_password_hash(user.password)))
        db.commit()

    @staticmethod
    def get_user_by_email_and_password(email: str, passwordHash: str):
        """Найти пользователя по email и паролю
        :param email:       электронная почта
        :type email:        str
        :param passwordHash:    хэш пароля
        :type passwordHash:     str
        :return: пользователь
        :rtype: User
        """
        user_data = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
        if user_data and check_password_hash(user_data[2], passwordHash):
            return User(id=user_data[0], email=user_data[1], password=user_data[2])
        else:
            return None

    @staticmethod
    def get_user_by_id(id: int):
        """Найти пользователя по id
        :param id:  идентификатор пользователя
        :type id:   int
        :return:    пользователь
        :rtype:     User"""
        user_data = db.execute('SELECT * FROM users WHERE id=?', (id,)).fetchone()
        if user_data:
            return User(id=user_data[0], email=user_data[1], password=user_data[2])
        else:
            return None

    @staticmethod
    def is_user_registred(email: str) -> bool:
        """Проверка есть ли уже пользователь с таким email
        :param email:       электронная почта
        :type email:        str
        :return:    True/False
        :rtype:     Boolean"""
        user_data = db.execute('SELECT * FROM users WHERE email=?', (email,)).fetchone()
        if user_data:
            return True
        else:
            return False

    @staticmethod
    def get_task_by_id(id):
        task_data = db.execute(
            'SELECT t.id, t.name, t.desc, t.completed FROM users u, tasks t, userTask ut WHERE t.id = ut.idTask '
            'and u.id = ut.idUser and u.id = ?', (id,)).fetchall()
        if task_data:
            return task_data
        else:
            return None

    @staticmethod
    def del_task(user_id, task_id):
        db.execute('DELETE FROM userTask WHERE idUser = ? and idTask = ?', (user_id, task_id))
        db.commit()

    @staticmethod
    def add_task(task, user_id):
        cursor = db.cursor()
        cursor.execute('INSERT INTO tasks (name, desc) VALUES (?, ?)', (task.name, task.desc))
        new_id = cursor.lastrowid
        cursor.execute('INSERT INTO userTask (idUser, idTask) VALUES (?, ?)', (user_id, new_id))
        db.commit()

    @staticmethod
    def update_task_status(task_id, action):
        if action == "completed":
            db.execute('UPDATE tasks SET completed = 1 WHERE id = ?', (task_id,))
            db.commit()
        if action == "uncompleted":
            db.execute('UPDATE tasks SET completed = 0 WHERE id = ?', (task_id,))
            db.commit()

    @staticmethod
    def get_task_status(task_id):
        task_status = db.execute('SELECT * FROM tasks WHERE id = ?', (task_id,)).fetchone()
        if task_status:
            return Task(task_status[0], task_status[1], task_status[2], task_status[3])
        else:
            return None
