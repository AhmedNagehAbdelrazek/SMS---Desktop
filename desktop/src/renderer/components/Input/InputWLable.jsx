import { Input, Typography } from "antd";

export default function InputWLable({ label, placeholder ,onChange ,value}) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <Typography className="font-bold">
                <Typography.Text>{label}</Typography.Text>
            </Typography>
            <Input className="w-full" placeholder={placeholder} value={value} onChange={onChange} />
        </div>
    );
}