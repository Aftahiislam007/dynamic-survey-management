'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fieldService } from '@/lib/api/fields';
import { FieldType, CreateFieldDto } from '@/types/field';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const fieldSchema = z.object({
  fields: z.array(
    z.object({
      label: z.string().min(1, 'Label is required'),
      type: z.nativeEnum(FieldType),
      required: z.boolean().default(false),
      options: z.string().optional().transform((val) => 
        val ? val.split(',').map(opt => opt.trim()).filter(opt => opt) : []
      ),
      placeholder: z.string().optional(),
      order: z.number(),
    })
  ),
});

interface FieldBuilderProps {
  surveyId: string;
}

const FieldBuilder: React.FC<FieldBuilderProps> = ({ surveyId }) => {
  const [existingFields, setExistingFields] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      fields: [{ label: '', type: FieldType.TEXT, required: false, order: 0 }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'fields',
  });

  const watchFields = watch('fields');

  useEffect(() => {
    loadExistingFields();
  }, [surveyId]);

  const loadExistingFields = async () => {
    setIsLoading(true);
    try {
      const data = await fieldService.getAll(surveyId);
      setExistingFields(data);
      
      if (data.length > 0) {
        reset({
          fields: data.map((field, index) => ({
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options?.join(', ') || '',
            placeholder: field.placeholder || '',
            order: index,
          })),
        });
      }
    } catch (error) {
      toast.error('Failed to load fields');
    } finally {
      setIsLoading(false);
    }
  };

  const addField = () => {
    append({
      label: '',
      type: FieldType.TEXT,
      required: false,
      options: '',
      placeholder: '',
      order: fields.length,
    });
  };

  const removeField = (index: number) => {
    remove(index);
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
    
    // Update order values
    const updatedFields = [...watchFields];
    updatedFields.forEach((field, idx) => {
      setValue(`fields.${idx}.order`, idx);
    });
  };

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      // First, delete existing fields
      for (const field of existingFields) {
        try {
          await fieldService.delete(field.id);
        } catch (error) {
          // Continue even if some deletions fail
        }
      }

      // Then create new fields
      const createPromises = data.fields.map((field: any, index: number) => {
        const fieldData: CreateFieldDto = {
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          order: index,
        };

        if ([FieldType.CHECKBOX, FieldType.RADIO, FieldType.SELECT].includes(field.type)) {
          const options = field.options;
          if (options && options.length > 0) {
            fieldData.options = options;
          }
        }

        return fieldService.create(surveyId, fieldData);
      });

      await Promise.all(createPromises);
      await loadExistingFields();
      toast.success('Fields saved successfully!');
    } catch (error) {
      toast.error('Failed to save fields');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Survey Fields</h2>
          <p className="text-sm text-gray-600">
            Add and organize fields for your survey
          </p>
        </div>
        <button
          onClick={addField}
          className="flex items-center space-x-2 btn-primary"
        >
          <Plus className="h-4 w-4" />
          <span>Add Field</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Field Label */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label *
                    </label>
                    <input
                      type="text"
                      {...register(`fields.${index}.label`)}
                      className="input-field"
                      placeholder="e.g., Email Address"
                    />
                    {errors.fields?.[index]?.label && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fields[index].label?.message}
                      </p>
                    )}
                  </div>

                  {/* Field Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      {...register(`fields.${index}.type`)}
                      className="input-field"
                    >
                      <option value={FieldType.TEXT}>Text Input</option>
                      <option value={FieldType.TEXTAREA}>Text Area</option>
                      <option value={FieldType.NUMBER}>Number</option>
                      <option value={FieldType.CHECKBOX}>Checkbox</option>
                      <option value={FieldType.RADIO}>Radio Button</option>
                      <option value={FieldType.SELECT}>Select Dropdown</option>
                    </select>
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      {...register(`fields.${index}.placeholder`)}
                      className="input-field"
                      placeholder="e.g., Enter your email"
                    />
                  </div>

                  {/* Required */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      {...register(`fields.${index}.required`)}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                    <label
                      htmlFor={`required-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Required field
                    </label>
                  </div>

                  {/* Options (for checkbox, radio, select) */}
                  {[
                    FieldType.CHECKBOX,
                    FieldType.RADIO,
                    FieldType.SELECT,
                  ].includes(watchFields[index]?.type) && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options (comma-separated) *
                      </label>
                      <input
                        type="text"
                        {...register(`fields.${index}.options`)}
                        className="input-field"
                        placeholder="e.g., Option 1, Option 2, Option 3"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Separate options with commas
                      </p>
                    </div>
                  )}

                  {/* Order Input (hidden) */}
                  <input
                    type="hidden"
                    {...register(`fields.${index}.order`)}
                    value={index}
                  />
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Remove field"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Move up/down buttons */}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => moveField(index, index - 1)}
                  disabled={index === 0}
                  className="flex items-center space-x-1 text-sm text-gray-600 disabled:opacity-50"
                >
                  <ChevronUp className="h-4 w-4" />
                  <span>Move Up</span>
                </button>
                <button
                  type="button"
                  onClick={() => moveField(index, index + 1)}
                  disabled={index === fields.length - 1}
                  className="flex items-center space-x-1 text-sm text-gray-600 disabled:opacity-50"
                >
                  <ChevronDown className="h-4 w-4" />
                  <span>Move Down</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-secondary"
            disabled={isSaving}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Fields'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tips:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use move up/down buttons to reorder fields</li>
          <li>• Checkboxes, Radio buttons, and Select fields require options</li>
          <li>• Required fields must be filled by officers</li>
          <li>• Changes are saved when you click "Save Fields"</li>
        </ul>
      </div>
    </div>
  );
};

export default FieldBuilder;