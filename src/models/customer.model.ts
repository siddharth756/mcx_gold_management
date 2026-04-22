import { DataTypes, Model, Sequelize } from 'sequelize';
import Order from './order.model';

export class Customer extends Model {
    public id!: string;
    public name!: string | null;
    public email!: string | null;
    public mobile!: string | null;
    public address!: string | null;
    public created_by!: string | null;
    public created_at!: Date;
    public updated_at!: Date;

    static initModel(connection: Sequelize): void {
        Customer.init(
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
                mobile: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                address: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                created_by: {
                    type: DataTypes.UUID,
                    allowNull: true,
                }
            },
            {
                tableName: 'customers',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );

    }

    static initAssociations(): void {
        Customer.hasMany(Order,{
            foreignKey: "customer_id",
            as: "order"
        })
    }

    // static initHooks(): void {
    // }
}

export default Customer;
