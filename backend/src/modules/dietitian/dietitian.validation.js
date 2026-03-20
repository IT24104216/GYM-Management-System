import { z } from 'zod';

const idSchema = z.string().trim().min(1, 'is required');
const isValidIsoDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
};

const dateSchema = z.string().trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
  .refine((value) => isValidIsoDate(value), {
    message: 'Invalid calendar date',
  });
const timeSchema = z.string().trim().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'must be HH:mm');
const phoneRegex = /^\d{10}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const SLASH_DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

const isValidDateInput = (value) => {
  if (!value) return true;

  if (ISO_DATE_REGEX.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.toISOString().slice(0, 10) === value;
  }

  if (SLASH_DATE_REGEX.test(value)) {
    const [mmRaw, ddRaw, yyyyRaw] = value.split('/').map(Number);
    if (!mmRaw || !ddRaw || !yyyyRaw) return false;
    const parsed = new Date(Date.UTC(yyyyRaw, mmRaw - 1, ddRaw));
    return (
      parsed.getUTCFullYear() === yyyyRaw
      && parsed.getUTCMonth() === mmRaw - 1
      && parsed.getUTCDate() === ddRaw
    );
  }

  return false;
};

export const dietitianIdParamsSchema = z.object({
  dietitianId: idSchema,
});

export const dietitianSlotIdParamsSchema = z.object({
  dietitianId: idSchema,
  slotId: idSchema,
});

export const dietitianProfileSchema = z
  .object({
    qualifications: z.string().trim().max(180).optional(),
    specialization: z.string().trim().max(140).optional(),
    experienceYears: z.coerce.number().min(0).max(80).optional(),
    licenseNumber: z.string().trim().max(80).optional(),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine((value) => !value || phoneRegex.test(value), {
        message: 'Invalid phone format. Use exactly 10 digits.',
      })
      .optional(),
    joinDate: z
      .string()
      .trim()
      .max(40)
      .refine((value) => isValidDateInput(value), {
        message: 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY.',
      })
      .optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    slots: z.string().trim().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    if (!String(data.qualifications || '').trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['qualifications'],
        message: 'Qualifications are required.',
      });
    }
    const exp = Number(data.experienceYears || 0);
    if (!exp || exp <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['experienceYears'],
        message: 'Experience is required.',
      });
    }
  });

export const createDietitianSlotSchema = z.object({
  date: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  notes: z.string().trim().max(500).optional().default(''),
});

export const updateDietitianSlotSchema = z
  .object({
    date: dateSchema.optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field is required for update' },
  );

