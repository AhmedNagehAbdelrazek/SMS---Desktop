import { GetProps, Input } from "antd";
import axios from "axios";
import { useAppDispatch } from "../shared/RTK/hooks";
import { addNewUser } from "../shared/RTK/slices/mainSlice";
import { useEffect, useState } from "react";
const { Search } = Input;


type SearchProps = GetProps<typeof Input.Search>;

export default function AddStudents(){

  const dispatch = useAppDispatch();

  const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
    if(info?.source != undefined && info?.source == 'input'){
      dispatch(addNewUser(value));
    }
  }
  function join(a:string,b:string,c:string){
    return `${a}\\${b}\\${c}`;
  }
  const [serverpath,setServerpath] = useState("");
  useEffect(()=>{
    // const projectPath = process.cwd();
    // const serverPath = join(projectPath, 'server', 'server-win.exe');
    // console.log(serverPath);
    // setServerpath(serverPath);
  },[]);

  return<>
    <Search
      placeholder="input search text"
      allowClear
      enterButton="Add"
      size="large"
      onSearch={onSearch}
    />
    <div>
      {serverpath}
      </div>
  </>;
}

