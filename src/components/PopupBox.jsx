import CommonButton from "./CommanButton";
const PopupBox = (props) => {
  return props.trigger ? (
    <div className="popup-Cont fixed w-full h-dvh bg-[#0002] flex justify-center items-center top-0 left-0">
      <div className="flex flex-col  p-5 rounded-xl glass-card w-lg h-80 items-center justify-center gap-4 relative">
        <div className="message-box text-center">
          <div className="logo flex justify-center">
            <img className="w-13.5" src={props.icon} alt="" srcset="" />
          </div>
          <h1 className="title text-3xl font-medium pt-2 pb-1">
            {props.title}
          </h1>
          <p className="message text-md">{props.msg}</p>
        </div>
        <div className="action-box flex gap-4 justify-center">
          <CommonButton label={"No"} variant="outline" className="w-32" onClick={()=> props.setTrigger(false) } />
          <CommonButton label={"Yes"} className="w-40"  onClick={()=> {
      
            props.setTrigger(false);
                  props.setConfirm();} } />
        </div>
      </div>
    </div>
  ) : (
    ""
  );
};

export default PopupBox;
