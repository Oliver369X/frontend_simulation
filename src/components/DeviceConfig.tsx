import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem, FormControlLabel,
  Switch
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface DeviceConfigProps {
  device: any;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const DeviceConfig: React.FC<DeviceConfigProps> = ({
  device,
  open,
  onClose,
  onSave
}) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      status: device?.status || 'active',
      updateInterval: device?.updateInterval || 5,
      ...device?.config
    }
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Configure Device</DialogTitle>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value === 'active'}
                        onChange={(e) => field.onChange(e.target.checked ? 'active' : 'inactive')}
                      />
                    )}
                  />
                }
                label="Device Active"
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="updateInterval"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Update Interval (seconds)"
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 