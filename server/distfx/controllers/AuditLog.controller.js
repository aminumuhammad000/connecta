import AuditLog from '../models/AuditLog.model.js';
export const createAuditLog = async (data) => {
    try {
        const auditLog = new AuditLog(data);
        await auditLog.save();
        return auditLog;
    }
    catch (error) {
        console.error('Error creating audit log:', error);
    }
};
export const getAllAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, action, entityType, adminId } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = {};
        if (action)
            query.action = action;
        if (entityType)
            query.entityType = entityType;
        if (adminId)
            query.adminId = adminId;
        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(Number(limit))
            .skip(skip);
        const total = await AuditLog.countDocuments(query);
        res.status(200).json({
            success: true,
            count: logs.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: logs,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching audit logs',
            error: error.message,
        });
    }
};
export const getAuditLogStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const totalLogs = await AuditLog.countDocuments();
        const logsToday = await AuditLog.countDocuments({ timestamp: { $gte: startOfDay } });
        const logsThisWeek = await AuditLog.countDocuments({ timestamp: { $gte: startOfWeek } });
        const logsThisMonth = await AuditLog.countDocuments({ timestamp: { $gte: startOfMonth } });
        // Action breakdown
        const actionStats = await AuditLog.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // Entity type breakdown
        const entityStats = await AuditLog.aggregate([
            { $group: { _id: '$entityType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        // Top admins by activity
        const topAdmins = await AuditLog.aggregate([
            { $group: { _id: { adminId: '$adminId', adminName: '$adminName' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalLogs,
                logsToday,
                logsThisWeek,
                logsThisMonth,
                actionStats,
                entityStats,
                topAdmins,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching audit log stats',
            error: error.message,
        });
    }
};
export const deleteAuditLogs = async (req, res) => {
    try {
        const { beforeDate } = req.query;
        const query = {};
        if (beforeDate) {
            query.timestamp = { $lt: new Date(beforeDate) };
        }
        const result = await AuditLog.deleteMany(query);
        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} audit logs`,
            deletedCount: result.deletedCount,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting audit logs',
            error: error.message,
        });
    }
};
