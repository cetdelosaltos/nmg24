import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';

@Component({
    selector: 'app-piesote',
    imports: [
        CommonModule,
    ],
    templateUrl: './piesote.component.html',
    styleUrl: './piesote.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PiesoteComponent implements OnInit {

  ngOnInit(): void { }

}
