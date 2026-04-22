import { DataTypes, Model, Sequelize } from 'sequelize';
import { OrderType, ProductType } from '../types/enums';
import User from './user.model';
import Branch from './branch.model';
import Customer from './customer.model';
import PriceLock from './priceLock.model';

export class Order extends Model {
    public id!: string;
    public dealer_id!: string | null;
    public branch_id!: string | null;
    public customer_id!: string | null;
    public price_lock_id!: string | null;
    public product_type!: ProductType;
    public order_type!: OrderType;
    public quantity!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    static initModel(connection: Sequelize): void {
        Order.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                dealer_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                branch_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'branches',
                        key: 'id'
                    }
                },
                customer_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'customers',
                        key: 'id'
                    }
                },
                price_lock_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: "price_lock",
                        key: 'id'
                    }
                },
                product_type: {
                    type: DataTypes.ENUM(...Object.values(ProductType)),
                    allowNull: true,
                },
                order_type: {
                    type: DataTypes.ENUM(...Object.values(OrderType)),
                    allowNull: true
                },
                quantity_kg: {
                    type: DataTypes.INTEGER,
                    allowNull: true
                }
            },
            {
                tableName: 'orders',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );

    }

    static initAssociations(): void {
        Order.belongsTo(User, {
            foreignKey: "dealer_id",
            as: "dealer"
        })

        Order.belongsTo(Branch, {
            foreignKey: "branch_id",
            as: "branch"
        })

        Order.belongsTo(Customer, {
            foreignKey: "customer_id",
            as: "customer"
        })

        Order.belongsTo(PriceLock, {
            foreignKey: "price_lock_id",
            as: "price_lock"
        })
    }

    // static initHooks(): void {
    // }
}

export default Order;
