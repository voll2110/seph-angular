import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

/*
 * Representa una serie de datos dentro
 * de una gráfica comparativa.
 */
export interface BarChartSeries {
  name: string;
  values: number[];
}

/*
 * Componente reutilizable para mostrar
 * comparaciones mediante gráficas de barras.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [
    CommonModule,
    NgxEchartsDirective
  ],
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.scss'
})
export class BarChartComponent implements OnChanges {

  // Título de la gráfica.
  @Input() title = '';

  // Categorías mostradas en el eje horizontal.
  @Input() labels: string[] = [];

  /*
   * Series que se compararán.
   * Ejemplo:
   * - Periodo anterior
   * - Periodo actual
   */
  @Input() series: BarChartSeries[] = [];

  // Configuración final de Apache ECharts.
  chartOptions: EChartsOption = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['title'] ||
      changes['labels'] ||
      changes['series']
    ) {
      this.buildChart();
    }
  }

  /*
   * Construye la configuración de la gráfica
   * con una o varias series de información.
   */
  private buildChart(): void {
    this.chartOptions = {
      title: {
        text: this.title,
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 600
        }
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },

      legend: {
        top: 30
      },

      grid: {
        left: 45,
        right: 20,
        top: 80,
        bottom: 45,
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: this.labels,
        axisLabel: {
          interval: 0
        }
      },

      yAxis: {
        type: 'value',
        min: 0
      },

      series: this.series.map(item => ({
        name: item.name,
        type: 'bar',
        data: item.values,
        barMaxWidth: 42,
        label: {
          show: true,
          position: 'top'
        },
        emphasis: {
          focus: 'series'
        }
      }))
    };
  }
}