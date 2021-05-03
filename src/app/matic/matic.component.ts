import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-matic',
  templateUrl: './matic.component.html',
  styleUrls: ['./matic.component.scss'],
})
export class MaticComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    console.log('Matic');
  }
}
