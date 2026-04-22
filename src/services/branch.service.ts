import { Transaction } from "sequelize";
import { Branch } from "../models";
import { BranchPayload } from "../types/branch.interfaces";
import { responseMessages } from "../utils/response-message.service";

// const branchAttributes = ['id', 'name', 'email', 'mobile']

const getBranchByName = async (name: string) => {
    return await Branch.findOne({ where: { name, is_deleted: false } })
}

const getBranches = async () => {
    return await Branch.findAll({ where: { is_deleted: false } })
}


const createBranch = async (branchData: BranchPayload, createdBy?: string | null, transaction?: Transaction) => {
    return await Branch.create({
        ...branchData, ...(createdBy && { created_by: createdBy })
    }, { transaction })
}

const getBranchById = async (branch_id: string) => {
    return await Branch.findOne({ where: { id: branch_id, is_deleted: false } })
}

const updateBranch = async (branch_id: string, branchData: BranchPayload, updatedBy?: string | null, transaction?: Transaction) => {
    await Branch.update({
        ...branchData,
        updated_at: new Date(),
        ...(updatedBy && { updated_by: updatedBy })
    }, { where: { id: branch_id, is_deleted: false }, transaction },)
}

const deleteBranch = async (branch_id: string, deletedBy?: string | null, transaction?: Transaction) => {
    const branch = await Branch.findOne({ where: { id: branch_id }, transaction })
    if (branch?.is_deleted) {
        return { error: responseMessages.branch.branchAlreadyDeleted } as const
    }
    await Branch.update({ is_deleted: true, deleted_at: new Date(), ...(deletedBy && { deleted_by: deletedBy }) }, { where: { id: branch_id, is_deleted: false }, transaction })

    return { message: "Branch deleted successfully." }
}

export default {
    getBranches,
    getBranchById,
    getBranchByName,
    createBranch,
    updateBranch,
    deleteBranch
}