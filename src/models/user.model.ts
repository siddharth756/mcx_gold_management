import { DataTypes, Model, Sequelize } from 'sequelize';
import { UserRole } from '../types/enums';
import Branch from './branch.model';
import DealerDistributions from './dealerDistributions.model';
import PriceLock from './priceLock.model';
import Order from './order.model';

export class User extends Model {
    public id!: string;
    public name!: string | null;
    public email!: string | null;
    public password!: string | null;
    public role!: UserRole;
    public mobile!: string | null;
    public address!: string | null;
    public branch_id!: string | null;
    public is_deleted!: boolean;
    public created_by!: string | null;
    public updated_by!: string | null;
    public deleted_by!: string | null;
    public created_at!: Date;
    public updated_at!: Date;
    public deleted_at!: Date | null;

    static initModel(connection: Sequelize): void {
        User.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                role: {
                    type: DataTypes.ENUM(...Object.values(UserRole)),
                    allowNull: true,
                },
                mobile: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                address: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                branch_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'branches',
                        key: 'id'
                    }
                },
                is_deleted: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                created_by: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                updated_by: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                deleted_by: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                deleted_at: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            {
                tableName: 'users',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );

    }

    static initAssociations(): void {
        User.belongsTo(Branch, {
            foreignKey: 'branch_id',
            as: "branch"
        })

        User.hasMany(DealerDistributions, {
            foreignKey: "dealer_id",
            as: "dealer_distributions",
        })

        User.hasMany(PriceLock, {
            foreignKey: "dealer_id",
            as: "price_lock",
        })

        User.hasMany(Order, {
            foreignKey: "dealer_id",
            as: "order"
        })
    }

    // static initHooks(): void {
    // }
}

export default User;
