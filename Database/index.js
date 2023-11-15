import fs from 'fs';
import path from 'path';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const readJsonFileSync = (filepath, encoding = 'utf8') => {
    // Correct path for different OS
    const correctPath = path.join(dirname, filepath).replace(/^(\w:\\)/, '/');
    return JSON.parse(fs.readFileSync(correctPath, encoding));
};

const courses = readJsonFileSync('./courses.json');
const modules = readJsonFileSync('./modules.json');
const assignments = readJsonFileSync('./assignments.json');
const users = readJsonFileSync('./users.json');
const grades = readJsonFileSync('./grades.json');
const enrollments = readJsonFileSync('./enrollments.json');

export default {
    courses,
    modules,
    assignments,
    users,
    grades,
    enrollments,
};
