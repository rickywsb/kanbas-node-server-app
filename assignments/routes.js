import Database from "../Database/index.js";

function AssignmentRoutes(app) {

    // Get all assignments for a specific course
    app.get('/api/courses/:cid/assignments', (req, res) => {
        const { cid } = req.params;
        const courseAssignments = Database.assignments.filter(a => a.course === cid);
        res.json(courseAssignments);
    });
  
    // Get a single assignment by ID
    app.get('/api/assignments/:id', (req, res) => {
        const assignment = Database.assignments.find(a => a._id === req.params.id);
        if (!assignment) {
            return res.status(404).send('Assignment not found');
        }
        res.json(assignment);
    });
  
    // Create a new assignment for a specific course
    app.post('/api/courses/:cid/assignments', (req, res) => {
        const { cid } = req.params;
        const newAssignment = { _id: Date.now().toString(), course: cid, ...req.body };
        Database.assignments.push(newAssignment);
        res.status(201).json(newAssignment);
    });
  
    // Update an existing assignment
    app.put('/api/assignments/:id', (req, res) => {
        const index = Database.assignments.findIndex(a => a._id === req.params.id);
        if (index === -1) {
            return res.status(404).send('Assignment not found');
        }
        Database.assignments[index] = { ...Database.assignments[index], ...req.body };
        res.json(Database.assignments[index]);
    });
  
    // Delete an assignment
    app.delete('/api/assignments/:id', (req, res) => {
        console.log("Requested to delete assignment with ID:", req.params.id);
        const index = Database.assignments.findIndex(a => a._id === req.params.id);
        if (index === -1) {
            console.log("Assignment not found for ID:", req.params.id);
            return res.status(404).send('Assignment not found');
        }
        Database.assignments.splice(index, 1);
        console.log("Assignment deleted successfully");
        res.status(204).send();
    });
    
}

export default AssignmentRoutes;
