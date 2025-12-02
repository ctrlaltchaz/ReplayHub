import { createId } from '@paralleldrive/cuid2';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('global_users')
export class GlobalUser {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'totp_secret', length: 32, nullable: true })
  totpSecret?: string;

  @Column({ name: 'backup_codes', type: 'text', array: true, nullable: true })
  backupCodes?: string[];

  @Column({ name: 'quick_login_pin_hash', length: 255, nullable: true })
  quickLoginPinHash?: string;

  @Column({ name: 'quick_login_enabled', default: false })
  quickLoginEnabled: boolean;

  @Column({ name: 'quick_login_device_id', length: 255, nullable: true })
  quickLoginDeviceId?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  // Profile fields
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ length: 255, nullable: true })
  location?: string;

  @Column({ length: 100, nullable: true })
  timezone?: string;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // Relations using string references to avoid circular imports
  @OneToMany('Organisation', 'owner')
  organisations: any[];

  @OneToMany('OrganisationAdmin', 'globalUser')
  organisationAdmins: any[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = createId();
    }
  }
}
