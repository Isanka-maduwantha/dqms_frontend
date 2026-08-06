import React, {type ComponentProps} from 'react'

type ButtonProps = ComponentProps<'button'>  & {
  label: string;
  containerProps?:React.ComponentPropsWithoutRef<'div'>;
}

function CommanButton({label,containerProps,...props} : ButtonProps) {
  return (
   <>
  <div className="btn-cont"  {...containerProps}  >
       <button className=" w-full rounded-[10px] pl-3.25 pt-3.25 pr-3.25 pb-3.5 bg-accent text-white" {...props}  >
      {label}
    </button>
  </div>
   </>
  )
}

export default CommanButton