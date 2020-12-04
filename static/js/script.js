const ToDos = {

    loadingElement: document.getElementById('loading'),
    sectionContainer: document.getElementById('section-container'),
    errorElement: document.getElementById('error'),
    todoList: document.getElementById('todo-list'),

    async init() {
        try {
            const todos = await this.fetchTodos();
            this.fillTodosList(todos);
        } catch (e) {
            this.showError(e.message)
            return;
        }
    },

    setLoading(loading) {
        this.loadingElement.style.display = loading ? '' : 'none';
    },

    showError(error) {
        this.errorElement.textContent = error;
        this.errorElement.style.display = '';
    },

    async fetchTasks() {
        this.setLoading(true);
        const tasksResponse = await fetch(`${window.origin}/getTasks`);
        this.setLoading(false);
        if (!tasksResponse.ok) {
            throw new Error('Не удалось получить задачи... ');
        }
        const tasks = await tasksResponse.json();
        return tasks;
    },

    async fetchTodos() {
        this.setLoading(true);
        const todosResponse = await fetch('https://jsonplaceholder.typicode.com/todos');
        this.setLoading(false);
        if (!todosResponse.ok) {
            throw new Error('Не удалось получить комментарии... ');
        }
        const todos = await todosResponse.json();
        return todos;
    },

    async fillTodosList(todos) {
        for (const todo of todos) {
            const todoItem = document.querySelector(`li[data-id="${todo.id}"]`)
            let task_status = 0
            let task_description = 0
            if(todoItem)
            {
                const tasks = await this.fetchTasks();
                for (let i = 0; i < tasks.length; i++) {
                    if(tasks[i].id === todo.id) {
                        task_status = tasks[i].completed;
                        task_description = tasks[i].desc;
                        break;
                    }
                }
                // List Item (ToDo)
                const headerBlock = document.getElementById('header-block'+todo.id);
                // Task checkbox
                const checkboxDiv = document.createElement('div');
                checkboxDiv.classList.add("checkbox-completed");
                checkboxDiv.classList.add("float-right");
                checkboxDiv.classList.add("custom-control");
                checkboxDiv.classList.add("custom-checkbox");
                checkboxDiv.classList.add("form-control-lg");
                const chk = document.createElement('input');
                chk.setAttribute('type',"checkbox");
                chk.setAttribute('name',"taskComplete")
                chk.classList.add("custom-control-input");
                chk.setAttribute('id',"customCheck"+todo.id)
                if(task_status === 0)
                {
                    chk.checked = false;
                }
                else {
                    chk.checked = true;
                    todoItem.classList.add("completed-todo");
                    headerBlock.classList.add("completed-todo");
                }
                chk.addEventListener('change', async () => {
                    let currentCheckboxStatus = chk.checked
                    if (!confirm('Вы уверены, что хотите поменять статус этого задания?')) {
                        if (currentCheckboxStatus)
                            chk.checked = false
                        else
                            chk.checked = true
                        return;
                    }
                    let entry = {};
                    if(chk.checked)
                    {
                        todoItem.classList.add("completed-todo");
                        headerBlock.classList.add("completed-todo");
                        entry = {
                            task_id: todo.id,
                            action: "completed"
                        };
                    }
                    else {
                        todoItem.classList.remove("completed-todo");
                        headerBlock.classList.remove("completed-todo");
                        entry = {
                            task_id: todo.id,
                            action: "uncompleted"
                        };
                    }
                    await fetch(`${window.origin}`, {
                            method: "PATCH",
                            credentials: "include",
                            body: JSON.stringify(entry),
                            cache: "no-cache",
                            headers: new Headers({
                                "content-type": "application/json"
                            })
                        });
                });
                const chkLabel = document.createElement('label');
                chkLabel.htmlFor = "customCheck"+todo.id;
                chkLabel.appendChild(document.createTextNode('Выполнено'));
                checkboxDiv.appendChild(chk);
                checkboxDiv.appendChild(chkLabel);
                todoItem.appendChild(checkboxDiv);
                const divDesc = document.createElement('div');
                divDesc.classList.add("description-block");
                divDesc.appendChild(document.createTextNode(task_description))
                todoItem.appendChild(divDesc)
                todoItem.appendChild(document.createElement('hr'));

                // Todo comment
                const titleEl = document.createElement('div');
                const header2 = document.createElement('h2');
                const comment = document.createElement('div');
                header2.textContent = "Комментарий к задаче:";
                titleEl.appendChild(header2);
                comment.textContent = todo.title;
                titleEl.appendChild(comment);
                titleEl.classList.add('collapse');
                titleEl.setAttribute('id', "demo"+todo.id);
                todoItem.appendChild(titleEl);
                todoItem.appendChild(document.createElement('br'));
                // Remove button
                const button = document.createElement('button');
                button.classList.add('btn');
                button.classList.add('btn-danger');
                button.classList.add('btn-sm');
                button.classList.add('btn-remove-todo')
                button.classList.add('ml-auto');
                button.textContent = 'Удалить';
                button.addEventListener('click', () => { this.removeTodo(todo.id) });
                todoItem.appendChild(button);
                // Add todo to list
                this.todoList.appendChild(todoItem);
            }
        }
    },

    async removeTodo(id) {
        if (!confirm('Вы уверены, что хотите удалить это задание?')) {
            return;
        }

        try {
            this.setLoading(true);
            const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, { method: 'delete' });
            this.setLoading(false);
            if (!res.ok) {
                throw new Error("Не удалось удалить запись...");
            }

            const entry = {
                task_id: id
            };

            await fetch(`${window.origin}`, {
                method: "DELETE",
                credentials: "include",
                body: JSON.stringify(entry),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            });
            document.querySelector(`li[data-id="${id}"]`).remove();
        } catch (error) {
            this.showError(error.message);
        }
    },
}

ToDos.init();