import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Cotacao } from './cotacao';
import { CotacaoDolarService } from './cotacaodolar.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  cotacaoForm: FormGroup;
  cotacaoAtual: number = 0;
  cotacaoPorPeriodoLista: Cotacao[] = [];
  spinner: Boolean = false;

  exibirAlerta: boolean = false;
  mensagemAlerta = '';

  ngOnInit() {
    this.cotacaoDolarService.getCotacaoAtual().subscribe(cotacao => {
      this.cotacaoAtual = cotacao.preco;
    });
  }

  constructor(
    private cotacaoDolarService: CotacaoDolarService,
    private dateFormat: DatePipe,
    private formBuilder: FormBuilder,
  ) {
    const dataAtual = new Date();
    const primeiroDiaDoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);

    this.cotacaoForm = this.formBuilder.group({
      dataInicial: [this.formataData(primeiroDiaDoMes), Validators.required],
      dataFinal: [this.formataData(dataAtual), Validators.required],
      menorAtual: [false, [Validators.required]],
    });
  }

  public getCotacaoPorPeriodo(): void {
    this.cotacaoPorPeriodoLista = [];

    const dataInicial = this.dateFormat.transform(this.cotacaoForm.value.dataInicial, "MM-dd-yyyy") || '';
    const dataFinal = this.dateFormat.transform(this.cotacaoForm.value.dataFinal, "MM-dd-yyyy") || '';

    if (!dataInicial && !dataFinal) {
      this.alerta('Os campos de datas são obrigatórios!')
    } else if (new Date(dataInicial) > new Date() || new Date(dataFinal) > new Date()) {
      this.alerta('As datas informadas precisam ser igual ou inferior a atual!');
    } else if (new Date(dataInicial) > new Date(dataFinal)) {
      this.alerta('Data inicial deve ser menor que data final!');
    } else {
      this.spinner = true;
      if (this.cotacaoForm.value.menorAtual) {
        console.log("Menor Atual True")
        this.cotacaoDolarService.getCotacaoPorPeriodoMenorAtualFront(dataInicial, dataFinal).subscribe(cotacoes => {
          this.cotacaoPorPeriodoLista = cotacoes;
          this.spinner = false;
        });
      } else {
        console.log("Menor Atual False")
        this.cotacaoDolarService.getCotacaoPorPeriodoFront(dataInicial, dataFinal).subscribe(cotacoes => {
          this.cotacaoPorPeriodoLista = cotacoes;
          this.spinner = false;
        });
      }
    }
  }

  public limparConsulta() {
    this.cotacaoPorPeriodoLista = [];
  }

  public formataData(data: Date): string {
    const ano = data.getFullYear().toString();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0'); // Adiciona zero à esquerda se necessário
    const dia = data.getDate().toString().padStart(2, '0'); // Adiciona zero à esquerda se necessário

    return `${ano}-${mes}-${dia}`;
  }

  ocultarAlerta() {
    this.exibirAlerta = false;
  }

  alerta(mensagem: string) {
    this.mensagemAlerta = mensagem;
    this.exibirAlerta = true;
    setTimeout(() => { this.exibirAlerta = false }, 3000)
  }

  
}
