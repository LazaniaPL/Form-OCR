import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.component.html',
  styleUrls: ['./start-menu.component.scss']
})
export class StartMenuComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  routeToForm() {
    this.router.navigateByUrl('formularz');
  }
  routeToFormWithFile(){
    //this.router.navigateByUrl('formularz',{load:true});
  }
}
