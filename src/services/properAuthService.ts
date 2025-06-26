
import { secureAuthenticationService } from './secureAuthenticationService';

// Main authentication service that replaces insecure implementations
export const authenticateTeacher = secureAuthenticationService.authenticateTeacher.bind(secureAuthenticationService);
export const authenticateStudent = secureAuthenticationService.authenticateStudent.bind(secureAuthenticationService);
export const registerTeacher = secureAuthenticationService.registerTeacher.bind(secureAuthenticationService);
export const registerStudent = secureAuthenticationService.registerStudent.bind(secureAuthenticationService);
