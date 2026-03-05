import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-orion',
  templateUrl: './orion.component.html',
  styleUrls: ['./orion.component.scss']
})
export class OrionComponent {


  

  activeTab: string = 'entity';
  constructor() {

  }

  onTabChange(event: any) {
    this.activeTab = event.index === 0 ? 'entity' : event.index === 1 ? 'types' : 'subscriptions';
  }
}
