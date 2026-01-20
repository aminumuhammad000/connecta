"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../core/middleware/auth.middleware");
const CollaboController = __importStar(require("../controllers/Collabo.controller"));
const router = express_1.default.Router();
router.post('/create', auth_middleware_1.authenticate, CollaboController.createCollaboProject);
router.post('/scope', auth_middleware_1.authenticate, CollaboController.scopeProject);
router.get('/my-projects', auth_middleware_1.authenticate, CollaboController.getMyProjects);
router.post('/accept-role', auth_middleware_1.authenticate, CollaboController.acceptRole);
router.post('/:id/fund', auth_middleware_1.authenticate, CollaboController.fundProject);
router.post('/:id/activate', auth_middleware_1.authenticate, CollaboController.activateProject);
router.get('/:id', auth_middleware_1.authenticate, CollaboController.getCollaboProject);
router.get('/role/:id', auth_middleware_1.authenticate, CollaboController.getRole);
router.post('/message', auth_middleware_1.authenticate, CollaboController.sendMessage);
router.get('/messages', auth_middleware_1.authenticate, CollaboController.getMessages);
router.post('/task', auth_middleware_1.authenticate, CollaboController.createTask);
router.get('/tasks', auth_middleware_1.authenticate, CollaboController.getTasks);
router.patch('/task/:id', auth_middleware_1.authenticate, CollaboController.updateTask);
// Files
const fileUpload_1 = require("../core/utils/fileUpload");
router.post('/file', auth_middleware_1.authenticate, fileUpload_1.upload.single('file'), CollaboController.uploadFile);
router.get('/files', auth_middleware_1.authenticate, CollaboController.getFiles);
exports.default = router;
