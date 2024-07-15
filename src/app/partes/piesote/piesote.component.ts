import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-piesote',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './piesote.component.html',
  styleUrl: './piesote.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PiesoteComponent implements OnInit {

  ngOnInit(): void { }

}
