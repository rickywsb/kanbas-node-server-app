const assignment = {
    id: 1,
    title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJS",
    due: "2021-10-10",
    completed: false,
    score: 0,
  };
  
const todos = [
    { id: 1, title: "Task 1", completed: false },
    { id: 2, title: "Task 2", completed: true },
    { id: 3, title: "Task 3", completed: false },
    { id: 4, title: "Task 4", completed: true },
  ];
  

const Lab5 = (app) => {
    app.get("/a5/welcome", (req, res) => {
      res.send("Welcome to Assignment 5");
    });
    app.get("/a5/add/:a/:b", (req, res) => {
        const { a, b } = req.params;
        const sum = parseInt(a) + parseInt(b);
        res.send(sum.toString());
      });
      app.get("/a5/subtract/:a/:b", (req, res) => {
        const { a, b } = req.params;
        const sum = parseInt(a) - parseInt(b);
        res.send(sum.toString());
      });

      app.get("/a5/calculator", (req, res) => {
        const { a, b, operation } = req.query;
        let result = 0;
        switch (operation) {
          case "add":
            result = parseInt(a) + parseInt(b);
            break;
          case "subtract":
            result = parseInt(a) - parseInt(b);
            break;
          default:
            result = "Invalid operation";
        }
        res.send(result.toString());
      });

      app.get("/a5/assignment", (req, res) => {
        res.json(assignment);
      });
      app.get("/a5/assignment/title", (req, res) => {
        res.json(assignment.title);
      });
      
      app.get("/a5/assignment/title/:newTitle", (req, res) => {
        const { newTitle } = req.params;
        assignment.title = newTitle;
        res.json(assignment);
      });

      app.post('/a5/assignment/score/:newScore', (req, res) => {
        const newScore = parseInt(req.params.newScore);
        // Update the score in your assignment object
        // For demonstration, assuming there's an 'assignment' object
        assignment.score = newScore;
        res.json(assignment);
    });

    app.get("/a5/todos", (req, res) => {
        const { completed } = req.query;
        if (completed !== undefined) {
            // 将字符串 "true" 或 "false" 转换为布尔值
            const completedBool = completed === 'true';
    
            const completedTodos = todos.filter(t => t.completed === completedBool);
            res.json(completedTodos);
            return;
        }
    
        res.json(todos);
    });


    

        app.post('/a5/assignment/completed/:newCompleted', (req, res) => {
        const newCompleted = req.params.newCompleted === 'true'; // Convert to boolean
        assignment.completed = newCompleted;
        res.json(assignment);
      });

      app.get("/a5/todos/:id", (req, res) => {
        const { id } = req.params;
        const todo = todos.find((t) => t.id === parseInt(id));
        res.json(todo);
      });

      app.post("/a5/todos", (req, res) => {
        const newTodo = {
          ...req.body,
          id: new Date().getTime(),
        };
        todos.push(newTodo);
        res.json(newTodo);
      });
    

      app.delete("/a5/todos/:id", (req, res) => {
        const { id } = req.params;
        const todo = todos.find((t) => t.id === parseInt(id));
        if (!todo) {
          res.res
            .status(404)
            .json({ message:
              `Unable to delete Todo with ID ${id}` });
          return;
        }
        todos.splice(todos.indexOf(todo), 1);
        res.sendStatus(200);
      });
    
    

      app.get("/a5/todos/:id/title/:title", (req, res) => {
        const { id, title } = req.params;
        const todo = todos.find((t) => t.id === parseInt(id));
        todo.title = title;
        res.json(todos);
      });
      app.patch('/todos/:id/description', (req, res) => {
        const { id } = req.params;
        const { description } = req.body;
    
        const todo = todos.find(t => t.id === parseInt(id));
        if (todo) {
            todo.description = description;
            res.send(todo);
        } else {
            res.status(404).send('Todo not found');
        }
    });
    
    app.patch('/todos/:id/completed', (req, res) => {
        const { id } = req.params;
        const { completed } = req.body;
    
        const todo = todos.find(t => t.id === parseInt(id));
        if (todo) {
            todo.completed = completed;
            res.send(todo);
        } else {
            res.status(404).send('Todo not found');
        }
    });

    app.put("/a5/todos/:id", (req, res) => {
        const { id } = req.params;
        const todo = todos.find((t) => t.id === parseInt(id));
        if (!todo) {
            res.res
              .status(404)
              .json({ message:
                `Unable to update Todo with ID ${id}` });
            return;
          }
      
        todo.title = req.body.title;
        todo.description = req.body.description;
        todo.due = req.body.due;
        todo.completed = req.body.completed;
        res.sendStatus(200);
      });
    
    
    
    
    
    
    
  };
export default Lab5;