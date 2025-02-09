import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { SpecialOffer } from './special-offer.entity';

@Entity()
// TODO: check if special offer is unique for a customer or we can have multiple vouchers for the same special offer but with different expiration dates
// this should affect generating the voucher code endpoint
@Index(['customer', 'specialOffer'], { unique: true })
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column({ type: 'timestamp' })
  expirationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  redeemedAt: Date | null;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.vouchers)
  customer: Customer;

  @ManyToOne(() => SpecialOffer, (specialOffer) => specialOffer.vouchers)
  specialOffer: SpecialOffer;
}
