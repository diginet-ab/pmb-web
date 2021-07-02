import * as React from "react";
import {
    Button,
    useUpdateMany,
    useRefresh,
    useNotify,
    useUnselectAll,
} from 'react-admin';

const ResetAlarmsButton = ({ selectedIds, label, icon }: any) => {
    const refresh = useRefresh();
    const notify = useNotify();
    const unselectAll = useUnselectAll();
    const [updateMany, { loading }] = useUpdateMany(
        'posts',
        selectedIds,
        { views: 0 },
        {
            onSuccess: () => {
                refresh();
                notify('Posts updated');
                unselectAll('posts');
            },
            onFailure: (error: any) => notify('Error: posts not updated', 'warning'),
        }
    );

    return (
        <Button
            label={ label }
            disabled={loading}
            onClick={updateMany}
        >
            { icon }
        </Button>
    );
};

export default ResetAlarmsButton;