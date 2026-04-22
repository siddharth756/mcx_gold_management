import { DataTypes, Model, Sequelize } from 'sequelize';
import { ProductType } from '../types/enums';
import User from './user.model';
import Scripts from './scripts.model';
import Order from './order.model';

export class PriceLock extends Model {
    public id!: string;
    public dealer_id!: string | null;
    public script_id!: string | null;
    public product_type!: ProductType
    public price!: number | null;
    public lock_duration!: Date
    public created_at!: Date;
    public updated_at!: Date;

    static initModel(connection: Sequelize): void {
        PriceLock.init(
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
                script_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'scripts',
                        key: 'id'
                    }
                },
                product_type: {
                    type: DataTypes.ENUM(...Object.values(ProductType)),
                    allowNull: true,
                },
                price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true,
                },
                lock_duration: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                    allowNull: true,
                },
            },
            {
                tableName: 'price_lock',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );

    }

    static initAssociations(): void {
        PriceLock.belongsTo(User, {
            foreignKey: "dealer_id",
            as: "dealer"
        })

        PriceLock.belongsTo(Scripts, {
            foreignKey: "script_id",
            as: "scripts"
        })

        PriceLock.hasMany(Order, {
            foreignKey: "price_lock_id",
            as: "order"
        })
    }

    // static initHooks(): void {
    // }
}

export default PriceLock;
