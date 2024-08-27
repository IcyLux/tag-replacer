import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterOutlet } from '@angular/router';

export interface TagReplacementPair {
  tag: string;
  replacement: string;
  position: number;
}

const ebnfRegex: RegExp = /^[A-Za-z][A-Za-z0-9_]*$/;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatTableModule,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tag-replacer';

  input:string = '';
  output:string = '';

  tagReplacementPairs:TagReplacementPair[] = [];

  displayedColumns: string[] = ['select', 'tag', 'replacement'];
  dataSource = new MatTableDataSource<TagReplacementPair>(this.tagReplacementPairs);
  selection = new SelectionModel<TagReplacementPair>(true, []);

  private _snackBar = inject(MatSnackBar);

  openSnackBar(tags: string[]) {
    this._snackBar.open('Folgende Tags sind invalid: ' + tags, 'Close');
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  replaceTags() {
    let invalidTags:string[] = this.checkForInvalidTagsInSelection();

    if(invalidTags.length !== 0) {
      this.openSnackBar(invalidTags);
      return;
    }
    this.output = this.input;
    this.selection.selected.forEach(pair => {
      if(this.input.includes('{' + pair.tag + '}') && !this.input.includes('\\' + '{' + pair.tag + '}')) {
        this.output = this.output.replace('{' + pair.tag + '}', pair.replacement);
      }
      if(this.input.includes('\\' + '{' + pair.tag + '}')) {
        this.output = this.output.replace('\\' + '{' + pair.tag + '}', '{' + pair.tag + '}');
      }
    });
  }

  addRow() {
    const newRow = {"position": this.dataSource.data.length, "tag": "", "replacement": ""};
    let data = this.dataSource.data;
    data.push(newRow);
    this.dataSource.data = data;
  }

  removeRow() {
    let data = this.dataSource.data;
    let filteredData = data.filter(pair => !this.selection.selected.includes(pair));
    this.dataSource.data = filteredData;
  }

  checkForInvalidTagsInSelection() {
    let invalidTags:string[] = [];

    if(this.selection.selected !== null) {
      this.selection.selected.forEach(pair => {
        if(!this.checkIfTagIsValid(pair.tag)) {
          invalidTags.push(pair.tag);
        }
      })
    }
    return invalidTags;
  }

  checkIfTagIsValid(tag:string): boolean {
    return ebnfRegex.test(tag);
  }
}
