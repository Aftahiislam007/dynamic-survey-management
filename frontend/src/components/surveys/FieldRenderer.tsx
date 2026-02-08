import React from 'react';
import { Field, FieldType } from '@/types/field';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface FieldRendererProps {
  field: Field;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  index: number;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, register, errors, index }) => {
  const fieldName = `answers[${field.id}]`;
  const error = errors.answers?.[field.id];

  const renderField = () => {
    switch (field.type) {
      case FieldType.TEXT:
        return (
          <input
            type="text"
            {...register(fieldName, {
              required: field.required ? 'This field is required' : false,
            })}
            className="input-field"
            placeholder={field.placeholder || field.label}
          />
        );

      case FieldType.TEXTAREA:
        return (
          <textarea
            {...register(fieldName, {
              required: field.required ? 'This field is required' : false,
            })}
            className="input-field min-h-[100px]"
            placeholder={field.placeholder || field.label}
            rows={4}
          />
        );

      case FieldType.NUMBER:
        return (
          <input
            type="number"
            {...register(fieldName, {
              required: field.required ? 'This field is required' : false,
              valueAsNumber: true,
            })}
            className="input-field"
            placeholder={field.placeholder || field.label}
          />
        );

      case FieldType.CHECKBOX:
        return (
          <div className="space-y-2">
            {field.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${fieldName}-${optionIndex}`}
                  value={option}
                  {...register(`${fieldName}[]`)}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label
                  htmlFor={`${fieldName}-${optionIndex}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case FieldType.RADIO:
        return (
          <div className="space-y-2">
            {field.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center">
                <input
                  type="radio"
                  id={`${fieldName}-${optionIndex}`}
                  value={option}
                  {...register(fieldName, {
                    required: field.required ? 'Please select an option' : false,
                  })}
                  className="h-4 w-4 text-primary-600"
                />
                <label
                  htmlFor={`${fieldName}-${optionIndex}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case FieldType.SELECT:
        return (
          <select
            {...register(fieldName, {
              required: field.required ? 'Please select an option' : false,
            })}
            className="input-field"
          >
            <option value="">Select an option</option>
            {field.options?.map((option, optionIndex) => (
              <option key={optionIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            {...register(fieldName)}
            className="input-field"
            placeholder={field.placeholder || field.label}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error.message as string}
        </p>
      )}
    </div>
  );
};

export default FieldRenderer;