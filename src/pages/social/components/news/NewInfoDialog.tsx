import { NewInfoType } from '../../../../api/news/news.type';
import Dialog from '../../../../components/dialog/Dialog';
import { P12_AUTHOR_AVATOR } from '../../../../constants';
import { useNewDateFormat } from '../../../../hooks/news';
import './NewInfoDialog.less';

type NewInfoDialogProps = {
    newInfo: NewInfoType | null;
    open?: boolean;
    onClose?: () => void;
};
const NewInfoDialog = ({ newInfo, open, onClose }: NewInfoDialogProps) => {
    const newDate = useNewDateFormat(newInfo?.createTime);
    return (
        <Dialog
            open={open}
            onClose={onClose}
            className="new-dialog"
            extraHeader={<div className="new-dialog__title"></div>}
            author={<img src={P12_AUTHOR_AVATOR} alt={'P12'} />}
            title={newInfo?.title}
            subtitle={newDate}
            content={
                newInfo?.text && <div className="new-dialog__reset" dangerouslySetInnerHTML={{ __html: newInfo?.text }}></div>
            }
        ></Dialog>
    );
};
export default NewInfoDialog;
