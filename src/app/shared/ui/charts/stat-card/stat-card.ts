import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/*
 * Tarjeta reutilizable para mostrar
 * el resultado de una comparación.
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss'
})
export class StatCardComponent {

  // Periodo usado como referencia.
  @Input() previousPeriod: string | null = null;

  // Periodo que se está consultando.
  @Input() currentPeriod = '';

  // Cantidad que aumentó o disminuyó.
  @Input() difference = 0;

  // Porcentaje calculado por el backend.
  @Input() percentage = 0;

  // Estado recibido: Aumentó, Disminuyó, Sin cambios o Sin periodo anterior.
  @Input() status = 'Sin periodo anterior';

  get isIncrease(): boolean {
    return this.difference > 0;
  }

  get isDecrease(): boolean {
    return this.difference < 0;
  }

  get absoluteDifference(): number {
    return Math.abs(this.difference);
  }

  get absolutePercentage(): number {
    return Math.abs(this.percentage);
  }
}