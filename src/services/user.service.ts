import { Op, Transaction } from 'sequelize';
import { Branch, User } from '../models/index';
import { UserPayload, UserParams } from '../types/user.interfaces';
import { responseMessages } from '../utils/response-message.service';
import { compareAsync } from '../utils/crypto.service';
import { UserRole } from '../types/enums';

const userAttributes = ['id', 'name', 'email', 'role', 'mobile', 'address', 'password'];

const getUsers = async ({
    page,
    limit,
    role,
    search,
    sortBy = 'created_at',
    sortOrder = 'DESC'
}: UserParams) => {

    const offset = (page - 1) * limit;

    const where: any = {
        is_deleted: false
    };

    // Role
    if (role) {
        where.role = role;
    }

    // Search
    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        ];
    }

    const { rows, count } = await User.findAndCountAll({
        where,
        include: [{
            model: Branch,
            as: 'branch',
            required: false
        }],
        offset,
        limit,
        order: [[sortBy, sortOrder]]
    });

    return {
        users: rows,
        totalRecords: count
    };
};

const getUserByRole = async (role: UserRole) => {
    return await User.findAll({ where: { role: role, is_deleted: false } })
}

const getUserByEmail = async (email: string) => {
    return await User.findOne({ where: { email, is_deleted: false }, attributes: [...userAttributes] });
};

const getUserByBranchAndRole = async (branch_id: string, role: UserRole) => {
    return await User.findOne({ where: { branch_id, role, is_deleted: false } })
}

const getUserById = async (user_id: string) => {
    return await User.findOne({
        where: { id: user_id, is_deleted: false }
    });
};

const updateUser = async (user_id: string, updateData: UserPayload, updatedBy?: string | null, transaction?: Transaction) => {
    await User.update(
        {
            ...updateData,
            updated_at: new Date(),
            ...(updatedBy && { updated_by: updatedBy })
        },
        {
            where: { id: user_id, is_deleted: false }, transaction
        }
    );
};

/** Create a new user */
const createUser = async (userData: UserPayload, createdBy?: string | null, transaction?: Transaction) => {
    return await User.create({
        ...userData,
        ...(createdBy && { created_by: createdBy }),
    }, { transaction });
};

/** Delete user */
const deleteUser = async (user_id: string, deletedBy?: string | null, transaction?: Transaction) => {
    const user = await User.findOne({ where: { id: user_id }, transaction })
    if (user?.is_deleted) {
        return { error: responseMessages.user.userAlreadyDeleted } as const
    }
    await User.update({
        is_deleted: true,
        deleted_at: new Date(),
        ...(deletedBy && { deleted_by: deletedBy })
    }, { where: { id: user_id, is_deleted: false }, transaction });

    return { message: "User deleted successfully." }
}

/** Login with email and password */
const loginWithEmailAndPassword = async (email: string, password: string) => {
    const user = await getUserByEmail(email);

    // compare password
    const valid = await compareAsync(password, user?.dataValues.password)

    if (!valid) {
        return { error: responseMessages.authentication.invalidEmailOrPassword } as const;
    }
    return user?.toJSON();
};

export default {
    getUsers,
    getUserByEmail,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserByRole,
    loginWithEmailAndPassword,
    getUserByBranchAndRole
};