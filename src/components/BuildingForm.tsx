import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem, Alert
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { ENDPOINTS } from '../config';
import { Building, BuildingCreateRequest, DeviceCreate } from '../types';

interface BuildingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Building) => void;
}

interface BuildingFormData {
  name: string;
  type: 'office' | 'residential' | 'commercial';
  floors: number;
  rooms_per_floor: number;
}

const getDefaultDevices = (roomNumber: number): DeviceCreate[] => [
  {
    type: "temperature_sensor",
    status: "active" as const
  },
  {
    type: "pressure_sensor",
    status: "active" as const
  },
  {
    type: "valve_controller",
    status: "active" as const
  },
  {
    type: "damper_controller",
    status: "active" as const
  },
  {
    type: "frequency_controller",
    status: "active" as const
  },
  {
    type: "power_meter",
    status: "active" as const
  }
];

export const BuildingForm: React.FC<BuildingFormProps> = ({ open, onClose, onSubmit }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<BuildingFormData>();
  const [error, setError] = useState<string | null>(null);

  const handleSubmitForm: SubmitHandler<BuildingFormData> = async (data) => {
    try {
      const buildingRequest: BuildingCreateRequest = {
        name: data.name,
        type: data.type,
        floors: Array.from({ length: data.floors }, (_, floorIndex) => ({
          number: floorIndex,
          rooms: Array.from({ length: data.rooms_per_floor }, (_, roomIndex) => ({
            number: roomIndex,
            devices: getDefaultDevices(roomIndex)
          }))
        }))
      };

      console.log('Enviando request:', buildingRequest);

      const response = await fetch(ENDPOINTS.buildings, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buildingRequest)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      const result = await response.json();
      onSubmit(result.building);
      onClose();
    } catch (error) {
      console.error('Error completo:', error);
      setError('Error al crear el edificio');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nuevo Edificio</DialogTitle>
      <form onSubmit={handleSubmit(handleSubmitForm)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{ required: 'El nombre es requerido' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nombre del Edificio"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="type"
                control={control}
                defaultValue="office"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Tipo de Edificio"
                    fullWidth
                  >
                    <MenuItem value="office">Oficina</MenuItem>
                    <MenuItem value="residential">Residencial</MenuItem>
                    <MenuItem value="commercial">Comercial</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="floors"
                control={control}
                defaultValue={1}
                rules={{ min: 1, max: 50 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Número de Pisos"
                    fullWidth
                    inputProps={{ min: 1, max: 50 }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="rooms_per_floor"
                control={control}
                defaultValue={4}
                rules={{ min: 1, max: 20 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Habitaciones por Piso"
                    fullWidth
                    inputProps={{ min: 1, max: 20 }}
                  />
                )}
              />
            </Grid>
          </Grid>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            Crear
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 