import React, { forwardRef } from 'react';

import { Dialog, DialogContent, DialogActions, Button, DialogTitle } from '@material-ui/core';

interface Props {
	open: boolean;
	handleCancel: () => void;
	handleOk: () => void;
}

const ConfirmationDialog: React.FC<Props> = forwardRef(
	({ open, handleCancel, handleOk, ...rest }, ref) => {
		function onOk(): void {
			handleOk();
			handleCancel();
		}

		return (
			<Dialog maxWidth="lg" open={open} onClose={handleCancel} ref={ref} {...rest}>
				<DialogTitle>Tem certeza?</DialogTitle>

				<DialogContent dividers>
					<p>Deseja realmente apagar os dados salvos em cache e recarregá-los novamente?</p>
					<p>Esta operação pode demorar um pouco...</p>
				</DialogContent>

				<DialogActions>
					<Button variant="contained" color="primary" onClick={handleCancel}>
						Cancelar
					</Button>
					<Button variant="outlined" onClick={onOk}>
						Tenho certeza
					</Button>
				</DialogActions>
			</Dialog>
		);
	},
);

export default ConfirmationDialog;
