import { GetProps, Input } from "antd";
import axios from "axios";
import { useAppDispatch } from "../shared/RTK/hooks";
import { addNewUser } from "../shared/RTK/slices/mainSlice";
const { Search } = Input;


type SearchProps = GetProps<typeof Input.Search>;

export default function AddStudents(){

  const dispatch = useAppDispatch();

  const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
    if(info?.source != undefined && info?.source == 'input'){
      dispatch(addNewUser(value));
    }
  }

  return<>
    <Search
      placeholder="input search text"
      allowClear
      enterButton="Add"
      size="large"
      onSearch={onSearch}
    />
  </>;
}

