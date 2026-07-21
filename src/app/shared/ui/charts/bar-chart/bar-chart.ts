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

  /*
   * Color utilizado por todas las barras
   * correspondientes a esta serie.
   */
  color?: string;
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

  /*
   * Colores asignados a los indicadores.
   * Cada posición corresponde a una categoría.
   */
  @Input() colors: string[] = [];

  // Configuración final de Apache ECharts.
  chartOptions: EChartsOption = {};

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['title'] ||
      changes['labels'] ||
      changes['series'] ||
      changes['colors']
    ) {

      this.buildChart();

    }

  }

  /*
   * Construye la configuración de la gráfica
   * con una o varias series de información.
   */
  private buildChart(): void {

    /*
     * Cuando existe una sola serie y se reciben
     * colores por indicador, cada categoría se
     * convierte en una serie independiente.
     *
     * Esto permite que la leyenda muestre el nombre
     * y el color correspondiente de cada barra.
     */
    const chartSeries =
      this.series.length === 1 && this.colors.length > 0
        ? this.labels.map((label, index) => ({

            name: label,

            type: 'bar' as const,

            data: this.labels.map(
              (_, dataIndex) =>
                dataIndex === index
                  ? this.series[0].values[index] ?? 0
                  : null
            ),

            itemStyle: {
              color:
                this.colors[index] ??
                '#65122E'
            },

            barMaxWidth: 42,

            label: {
              show: true,
              position: 'top' as const
            },

            emphasis: {
              focus: 'series' as const
            }

          }))
        : this.series.map((item, index) => ({

            name: item.name,

            type: 'bar' as const,

            data: item.values,

            /*
             * En gráficas con varias series,
             * cada serie conserva su color.
             */
            itemStyle: {
              color:
                item.color ??
                this.colors[index] ??
                '#65122E'
            },

            barMaxWidth: 42,

            label: {
              show: true,
              position: 'top' as const
            },

            emphasis: {
              focus: 'series' as const
            }

          }));

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

      /*
       * La leyenda toma automáticamente el nombre
       * y color correspondiente de cada indicador.
       */
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

      series: chartSeries

    };

  }

}