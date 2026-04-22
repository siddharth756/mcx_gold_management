import { DataTypes, Model, Sequelize } from 'sequelize'
import User from './user.model';
import { UserRole } from '../types/enums';
import BranchDistributions from './branchDistributions.model';
import DealerDistributions from './dealerDistributions.model';
import Order from './order.model';

export class Branch extends Model {
    public id!: string;
    public name!: string | null;
    public address!: string | null;
    public is_deleted!: boolean;
    public created_by!: string | null;
    public updated_by!: string | null;
    public deleted_by!: string | null;
    public created_at!: Date;
    public updated_at!: Date;
    public deleted_at!: Date | null;

    static initModel(connection: Sequelize): void {
        Branch.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            is_deleted: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            created_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            updated_by: {
                type: DataTypes.UUID,
                allowNull: true
            },
            deleted_by: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
            {
                tableName: 'branches',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        )
    }

    // Branch has one admin
    static initAssociations(): void {
        // Branch has one Branch Admin
        Branch.hasOne(User, {
            foreignKey: "branch_id",
            as: "branch_admin",
            constraints: false,
            scope: {
                role: UserRole.BRANCH_ADMIN
            }
        })

        // Branch has many Dealer scoped by role
        Branch.hasMany(User, {
            foreignKey: 'branch_id',
            as: 'dealer',
            scope: {
                role: UserRole.DEALER
            }
        })

        // Branch has many BranchDistributions
        Branch.hasMany(BranchDistributions, {
            foreignKey: "branch_id",
            as: "branch_distributions"
        })

        // Branch has many DealerDistributions
        Branch.hasMany(DealerDistributions, {
            foreignKey: "branch_id",
            as: "dealer_distributions"
        })

        // Branch has many order
        Branch.hasMany(Order, {
            foreignKey: "branch_id",
            as: "order"
        })
    }

    // static initHooks(): void {
    // }
}

export default Branch;