import React ,{ type ComponentProps } from 'react';

type FormInputProps = ComponentProps<'input'> & {
    label: string;
    padding?: string;
}
function FormInput({label,padding="16px", type = "text", id, ...props}: FormInputProps) {
  return (
    <div className='flex flex-col w-full' style ={{paddingTop: padding}} >
        <label className='font-inter text-[12px] font-bold text-green-text-1 text-left'  htmlFor={id}>{label}</label>
        <input type={type} id={id} {...props} className='pl-4 pr-4 pt-2.75 pb-2.75 outline-none bg-white border border-border-grey rounded-[10px] text-muted-green text-[14px] ' />
    </div>
  )
}

export default FormInput